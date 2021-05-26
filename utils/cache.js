var nano = require("nano");
const { clientChatTemplate, serverMeta } = require("../utils/socket_template");
const { storedMsgModel, saveOrUpdateMsg, saveMsg, getManyMsgs, updateMsg } = require("../utils/storedMsgTemplate");

let myCache = manageCache();

function manageCache() {
    let updating = false;
    let cacheTemplate = {
        client_id: "",
        canRefresh: true,
        timeOfLastUpdate: (new Date()).toISOString(),
        timeOfLastRead: (new Date()).toISOString(),
        frequencyOfRead: (new Date()).toISOString(),
        bookmark: "", warning:undefined, execution_stats:undefined,
        docs: [
            { _rev: "", client_id: "" }
        ]
    }

    let cachePolicy = {
        lru: 0,
        lfu: 1,
        lrfu: 2
    }

    /**
     * @type {[cacheTemplate]}
     */
    let backUpChats = [];
    let cacheIndexes = {};

    function indexer(id, arrayPosition) {
        cacheIndexes[id] = arrayPosition;
        //console.log("Index created...")
        //console.log(cacheIndexes)
        //console.log("Index created...")
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
            //console.log("Index is empty")
            return
        }
    }

    function findIndexClient(client_id) {
        //console.log("Finding index")
        //console.log(cacheIndexes)
        //console.log(cacheIndexes[client_id])
        let indexPos = cacheIndexes[client_id];
        if (Number.isInteger(indexPos)) {
            //console.log("Index found")
            return indexPos;
        } else {
            //console.log("Index key doesn't match record")
        }
    }
    /**
     * 
     * @param {*} client_id 
     * @param {{limit:number,skip:number,findAll:false}} opts 
     * @returns 
     */
    async function findClientInCache(client_id, opts = { skip: 0, limit: 2,  findAll: false }) {
        let arrayPos = findIndexClient(client_id);
        if (Number.isInteger(arrayPos)) {
            let item = backUpChats[arrayPos];
            if (item.client_id === client_id) {
                let itemToReturn;
                let docs = item.docs
                if (opts.findAll) {
                    console.log("To read all in cache")
                }
                else if (Number.isInteger(opts.skip)) {
                    let startIndex = (docs.length - 1) - (opts.skip - opts.limit);
                    let endIndex = (docs.length - 1) - (opts.skip + 1)
                    if (startIndex >= 1) {
                        docs = docs.slice(startIndex, endIndex)
                    } else if (startIndex < 1) {
                        await fillClientCacheFromFront(client_id, { limit: 10,
                            bookmark:item.bookmark
                        });
                    }
                } else if (opts.lastRevRead) {
                    if (lastRevIndex > -1) {
                        if (opts.limit > lastRevIndex) {
                            docs = docs.slice(0, lastRevIndex)
                        }
                    } else {
                        docs = []
                    }
                } else {
                    itemToReturn = { ...item }
                }
                itemToReturn = { ...item, docs }
                return itemToReturn
            } else {
                //console.log("Item cache not found")
            }
        }
    }

    function clientExistsInCache(client_id) {
        let exists = false
        let arrayPos = findIndexClient(client_id);
        if (Number.isInteger(arrayPos)) {
            let item = backUpChats[arrayPos];
            //console.log(item.client_id === client_id)
            if (item.client_id === client_id) {
                exists = true;
            } else {
                //console.log("Index doesn't match record")
            }
        }
        return exists
    }

    async function fillClientCacheFromFront(client_id, opts = { limit: 5, leadingRev: "" }) {
        let indexFound = findIndexClient(client_id);
        if (Number.isInteger(indexFound)) {
            let clientData = backUpChats[indexFound];
            let bookmark=clientData.bookmark;
            let msgs = clientData.docs;
            if (msgs.length >= 10) {
                let fetchedMsgs = await getManyMsgs(client_id, { limit, 
                    bookmark });
                let { docs, ...restOf } = fetchedMsgs
                let newRows = [...docs, ...msgs.slice(limit)]
                clientData.docs = newRows;
                clientData = { ...clientData, ...restOf }
                console.log("New cache msgs filled in for " + client_id)
            }
        }
    }
    //called once a socket is connected. Checks if client is exists in cache. 
    //if not, loads client data from DB
    async function primeClient(client_id, opts = {}) {
        let primed = false;
        let clientInCache =await findClientInCache(client_id, opts);
        //console.log(clientInCache)
        if (!clientInCache) {
            //fetch from DB
            let clientMsgs = await getManyMsgs(client_id);
            //add to cache
            await createOrUpdateCacheFromDB(client_id, clientMsgs)
        } else {
            //console.log("Found in cache")
        }
        primed = clientExistsInCache(client_id);
        //console.log("Client is primed...." + primed);
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
        let indexPos = findIndexClient(client_id);
        //create new clientData
        let { docs: docsFromServer, ...restOf } = data
        if (!Number.isInteger(indexPos)) {
            if (backUpChats.length > 100) {
                //console.log("Cache memory full");
                backUpChats[0].docs = []
            }
            //create in a fresh spot
            else {
                //console.log("Creating updatable...")
                let metaData = cacheItemMetaManager(client_id, { action: "update" });
                //console.log("Creating new cache item...")
                let index = backUpChats.push({ ...metaData,...data }) - 1;
                //console.log(backUpChats[index])
                //console.log("Index of..." + index)
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

    //save client message data to db then cache
    async function saveToDBThenClient(client_id, data) {
        if (!data.id) {
            throw "No id on message...";
        }
        //console.log("Here to save")
        let { id, ...rest } = data;
        let { id: _id, rev: _rev } = await saveMsg(rest, id);
        //console.log("Has saved")
        let index = findIndexClient(client_id);
        let dataUpdated = { _rev, _id, ...rest }
        backUpChats[index].docs.push(dataUpdated);
    }

    //update client message data to db then cache
    async function updateDBThenClient(client_id, data) {
        if (!data._rev) {
            throw "No _rev on message..."
        }
        let { id: _id, rev: _rev } = await updateMsg(data);
        let index = findIndexClient(client_id)
        let dataUpdated = { _rev, data }
        //replace old message with new
        let docs = backUpChats[index].docs;
        let indexFound = docs.findIndex(dbObj => dbObj._id === _id);
        if (indexFound > -1) {
            backUpChats[index].docs[indexFound] = dataUpdated;
        }
    }

    async function findClientMsgs(client_id, opts) {
        let clientData =await findClientInCache(client_id, opts)
        if (!clientData) {
            let freshFromDB = await getManyMsgs(client_id);
            await createOrUpdateCacheFromDB(client_id,freshFromDB);
            clientData = findClientInCache(client_id, opts)
        }
        return clientData
    }

    async function updateSocketIdCount(client_id) {
        //first locally update cache

        let clientData = backUpChats.find(item => item.client_id === client_id);
        if (clientData) {

        }
        await getManyMsgs(client_id);
        return clientData
    }

    return {
        primeClient, createOrUpdateCacheFromDB, updateSyncCache, backUpChats,
        findClientMsgs, updateSocketIdCount, updateDBThenClient, saveToDBThenClient,
        fillClientCacheFromFront
    }
}

module.exports = { myCache }



