var nano = require("nano");
const { clientChatTemplate, serverMeta } = require("../../utils/socket_template");
const { storedMsgModel, saveOrUpdateMsg, saveMsg, getManyMsgs, updateMsg } = require("../../utils/storedMsgTemplate");
let msgMaxCapacity = 15
let cacheTemplate = {
    client_id: "",
    canRefresh: true,
    timeOfLastUpdate: (new Date()).toISOString(),
    timeOfLastRead: (new Date()).toISOString(),
    frequencyOfRead: (new Date()).toISOString(),
    bookmark: "", warning: undefined, execution_stats: undefined,
    docs: [
        { _rev: "", _id: "", client_id: "" }
    ]
}

/**
 * @type {[cacheTemplate]}
 */
let backUpChats = [];
let cacheIndexes = {};

function indexer(id, arrayPosition) {
    cacheIndexes[id] = arrayPosition;
}

/**
 * 
 * @param {cacheTemplate} item 
 */

function cacheItemMetaManager(client_id, opts = { action: "read" }) {
    let cacheItem = { ...cacheTemplate };
    cacheItem.client_id = client_id
    if (opts.action === "read") {
        cacheItem.timeOfLastRead = new Date().toISOString()
    }
    if (opts.action === "create") {
        cacheItem.timeOfLastUpdate = new Date().toISOString()
    }
    return cacheItem;
}


async function updateSyncCache(params) {
    for (let index = 0; index < backUpChats.length; index++) {
        const backUpItem = array[index];
        getManyMsgs(backUpItem.client_id).then(res => {
            backUpChats[index] = { ...backUpChats[index], ...res };
        })
    }
}

async function clearItem(client_id) {
    addedToCache = false;
    let arrayPos = cacheIndexes[client_id];
    if (arrayPos) {
        let item = backUpChats[arrayPos];
        if (item.client_id === client_id) {

        } else {
        }
    } else {
        return
    }
}

function findClientIndex(client_id) {
    let indexPos = cacheIndexes[client_id];
    if (Number.isInteger(indexPos)) {
        return indexPos;
    } else {
    }
}


let cachePolicy = {
    lru: 0,
    lfu: 1,
    lrfu: 2
}

function clientExistsInCache(client_id) {
    let exists = false
    let arrayPos = findClientIndex(client_id);
    if (Number.isInteger(arrayPos)) {
        let item = backUpChats[arrayPos];
        if (item.client_id === client_id) {
            exists = true;
        } else {
        }
    }
    return exists
}

//called once a socket is connected. Checks if client is exists in cache. 
//if not, loads client data from DB
async function primeClient(client_id, opts = {}) {
    try {
        let primed = false;
        let clientCache = await manageClientCache(client_id, opts);
        if (!clientCache) {
            //fetch from DB
            let clientMsgs = await getManyMsgs(client_id, { limit: msgMaxCapacity, skip: 0 });
            if (clientMsgs.docs) {
                //add to cache
                //log(hkk)
                await createOrUpdateCacheFromDB(client_id, clientMsgs)
                let indexOf = findClientIndex(client_id)
            } else {
            }
        } else {
        }
        primed = clientExistsInCache(client_id);
    } catch (error) {
        console.log(error)
    }
}

async function manageClientCache(client_id, opts) {
    let response = await findClientInCache(client_id, opts);

    if (!response) {
        return null
    }
    let {clientCache} = response;
    
    //if docs in cache is less than capacity
    if (clientCache.docs.length < msgMaxCapacity) {
        try {
            await fillClientCacheFromFront(clientCache, opts);
            //try fetch client from cache
            clientCache = await findClientInCache(client_id, opts);
        } catch (error) {
            console.log(error)
            return clientCache
        }
    } else {
        return clientCache;
    }
}


//create cache data from db
/**
 * 
 * @param {string} client_id 
 * @param {nano.MangoResponse<any>} data 
 * @returns 
 */
async function createOrUpdateCacheFromDB(client_id, data) {
    let addedToCache = false;
    let indexPos = findClientIndex(client_id);
    //create new clientData
    let { docs: docsFromServer, ...restOf } = data
    if (!Number.isInteger(indexPos)) {
        if (backUpChats.length > 100) {
            backUpChats[0].docs = []
        }
        //create in a fresh spot
        else {
            let metaData = cacheItemMetaManager(client_id, { action: "update" });
            let index = backUpChats.push({ ...metaData, ...data }) - 1;
            indexer(client_id, index)
            addedToCache = true;
        }
    }
    //update db then cache
    else {
        let docs = backUpChats[indexPos].docs || []
        let metaData = cacheItemMetaManager(client_id, { action: "create" });
        docs.push(...docsFromServer);
        backUpChats[indexPos] = { ...metaData, ...restOf, docs }
        addedToCache = true;
    }
    return addedToCache
}

//save client message data to db then cache if updateCache
async function saveToDBThenClient(client_id, data, updateCache = true) {
    try {
        if (!data.id) {
            throw "No id on message...";
        }
        let { id, ...rest } = data;
        let { id: _id, rev: _rev } = await saveMsg(rest, id);
        let index = findClientIndex(client_id);
        if (!index) {
            return
        }
        if (updateCache) {
            let dataUpdated = { _rev, _id, ...rest }
            backUpChats[index].docs.push(dataUpdated);
        } else {
        }
    } catch (error) {
        console.log(error)
    }

}

//update client message data to db then cache
async function updateDBThenClient(client_id, data) {
    if (!data._rev) {
        throw "No _rev on message..."
    }
    let { id: _id, rev: _rev } = await updateMsg(data);
    let index = findClientIndex(client_id)
    let dataUpdated = { _rev, data }
    //replace old message with new
    let docs = backUpChats[index].docs;
    let indexFound = docs.findIndex(dbObj => dbObj._id === _id);
    if (indexFound > -1) {
        backUpChats[index].docs[indexFound] = dataUpdated;
    }
}

async function findClientMsgs(client_id, opts = { limit: 5, skip: 0 }) {
    try {
        let clientData = await manageClientCache(client_id, opts);
        if (!clientData) {
            let { earliestTimeReadISO = "", limit, } = opts
            let freshFromDB = await getManyMsgs(client_id, {
                limit,
                selector: {
                    "recipient_id": client_id,
                    "time_stamp_server_received": {
                        "$gt": earliestTimeReadISO
                    }
                }
            });
            if (freshFromDB.docs && freshFromDB.docs.length) {
                await createOrUpdateCacheFromDB(client_id, freshFromDB);
               let response = await findClientInCache(client_id, opts);
               clientData=response.clientCache;
            } else {
                return null;
            }
        }
        return clientData
    } catch (error) {
        console.log(error)
    }
}


let myCache = {
    primeClient, createOrUpdateCacheFromDB, updateSyncCache, backUpChats,
    findClientMsgs, updateDBThenClient, saveToDBThenClient, findClientIndex
}

module.exports = {
    myCache, findClientIndex,
    cacheSettings: { msgMaxCapacity }, dbFns: { getManyMsgs, saveMsg }
}
const fillClientCacheFromFront = require("./fillClientCacheFromFront");
const findClientInCache = require("./findClientInCache");




