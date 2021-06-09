var nano = require("nano");
const { clientChatTemplate, serverMeta } = require("../utils/socket_template");
const { storedMsgModel, saveOrUpdateMsg, saveMsg, getManyMsgs, updateMsg } = require("../utils/storedMsgTemplate");

let myCache = manageCache();

function manageCache() {
    let updating = false;
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
        let indexPos = cacheIndexes[client_id];
        if (Number.isInteger(indexPos)) {
            return indexPos;
        } else {
        }
    }
    /**
     * 
     * @param {*} client_id 
     * @param {{limit:number,lastId:string,lastTimeReadISO::string,findAll:false}} opts 
     * @returns 
     */
    async function findClientInCache(client_id, opts = {}) {
        let { lastId = "", lastTimeReadISO = "", limit = 2, skip = 0, findAll = false } = opts;
        let arrayPos = findIndexClient(client_id);
        if (Number.isInteger(arrayPos)) {
            let itemInCache = backUpChats[arrayPos];
            if (itemInCache.client_id === client_id) {
                let itemToReturn;
                let docs = itemInCache.docs
                if (findAll) {
                    console.log("To read all in cache");
                }
                else if (lastId) {
                    console.log("lastId")
                    //find index thereof
                    let lastReadItemIndex =
                        docs.findIndex(item => item._id === lastId &&
                            item.time_stamp_server_received === lastTimeReadISO);
                    console.log("lastIndex: " + lastReadItemIndex)
                    console.log("lastId")
                    //fetch 
                    if (lastReadItemIndex < limit) {
                        let filleResp = await fillClientCacheFromFront(client_id, {
                            limit: 10,
                            bookmark: itemInCache.bookmark,
                            lastTimeReadISO,
                        });
                        if (filleResp === 0) {
                            itemToReturn = { ...itemInCache, docs: [] }
                        }
                        else {
                            let resetDocs=backUpChats[arrayPos]. docs
                            let indexOfResetLastRead =resetDocs.findIndex(itemFound => itemFound._id === lastId &&
                                itemFound.time_stamp_server_received === lastTimeReadISO);
                            console.log("Reset last read: " + indexOfResetLastRead)
                            console.log("lastId: " + lastId)
                            console.log("lastTimeReadISO: " + lastTimeReadISO)
                            if (indexOfResetLastRead > -1) {
                                let startIndex = indexOfResetLastRead >
                                    limit ? indexOfResetLastRead - limit : 0
                                console.log("Reset start index read: " + startIndex)
                                docs = resetDocs.slice(startIndex, indexOfResetLastRead)
                            } else {
                                console.log("Return the whole")
                                docs = [...resetDocs]
                            }
                            if (filleResp === 1) {
                                console.log("Partially filled...");
                            }
                            if (filleResp === 2) {
                                console.log("Wholly filled...");
                            }
                            let item = backUpChats[arrayPos];
                            itemToReturn = { ...item, docs }
                        }
                        //await findClientInCache(client_id, opts);
                    }
                    else {
                        let startIndex = lastReadItemIndex - limit;
                        console.log("startIndex: " + startIndex);
                        docs = docs.slice(startIndex, lastReadItemIndex);
                        console.log("docs: " + docs.length)
                        itemToReturn = { ...itemInCache, docs }
                    }
                }
                else if (Number.isInteger(skip)) {
                    let startIndex = (docs.length) - (skip + limit);
                    let endIndex = (docs.length) - (skip - 1);
                    console.log(startIndex + " :: " + (endIndex >= msgMaxCapacity ? "max" : endIndex))
                    if (startIndex >= 1) {
                        console.log("yyyyyy");
                        if (endIndex >= msgMaxCapacity) {
                            docs = docs.slice(startIndex)
                        } else {
                            docs = docs.slice(startIndex, endIndex)
                        }
                        itemToReturn = { ...itemInCache, docs }
                    }
                    else if (startIndex < 1) {
                        console.log("ooooo");
                        let res = await fillClientCacheFromFront(client_id, {
                            limit: 10,
                            bookmark: itemInCache.bookmark,
                            lastTimeReadISO
                        });
                        console.log("res: " + res)
                        if (res === 0) {
                            itemToReturn = { ...itemInCache, docs: [] }
                        }
                        else {
                            let docs = []
                            let indexOfResetLastRead =
                                docs.findIndex(item => item._id === lastId &&
                                    item.time_stamp_server_received === lastTimeReadISO);
                            if (indexOfResetLastRead > -1) {
                                console.log("Reset last read: " + indexOfResetLastRead)
                                let startIndex = indexOfResetLastRead >
                                    limit ? indexOfResetLastRead - limit : 0
                                console.log("Reset start index read: " + startIndex)
                                docs = item.docs.slice(startIndex, indexOfResetLastRead)
                            } else {
                                docs = [...item.docs]
                            }
                            if (res === 1) {
                                console.log("Partially filled...");
                            }
                            if (res === 2) {
                                console.log("Wholly filled...");
                            }
                            let item = backUpChats[arrayPos];
                            itemToReturn = { ...item, docs }
                        }
                    }
                    else {
                        console.log("ffffffff");
                    }
                } else {
                    console.log("else")
                    itemToReturn = { ...itemInCache }
                }
                return itemToReturn
            } else {
                console.log("Item cache not found")
            }
        } else {
            //console.log("Empty")
        }
    }

    function clientExistsInCache(client_id) {
        let exists = false
        let arrayPos = findIndexClient(client_id);
        if (Number.isInteger(arrayPos)) {
            let item = backUpChats[arrayPos];
            if (item.client_id === client_id) {
                exists = true;
            } else {
            }
        }
        return exists
    }

    async function fillClientCacheFromFront(client_id, opts = {
        limit: 5, leadingRev: "", lastTimeReadISO
    }) {
        let fillState = {
            empty: 0,
            partial: 1,
            filled: 2
        }
        let indexFound = findIndexClient(client_id);
        let limit = opts.limit < msgMaxCapacity ? opts.limit : Math.floor((msgMaxCapacity / 4) * 3);
        console.log("limit selected: " + opts.limit)
        console.log("indexFound: " + indexFound)
        let fetchedMsgs;
        if (Number.isInteger(indexFound)) {
            let clientData = backUpChats[indexFound];
            let bookmark = clientData.bookmark;
            let docsInCache = clientData.docs;
            let newRows = []
            if (docsInCache.length >= msgMaxCapacity) {
                let lastReadItemIndex =
                    docsInCache.findIndex(item =>
                        item.time_stamp_server_received === opts.lastTimeReadISO);
                if (lastReadItemIndex > -1) {
                    console.log("Planning to Kick out items starting from " + lastReadItemIndex +
                        " (a total of" + (msgMaxCapacity - lastReadItemIndex) +
                        "), then fill to capacity from front");
                    fetchedMsgs = await getManyMsgs(client_id, {
                        limit: opts.limit,
                        selector: {
                            "time_stamp_server_received": {
                                "$gt": opts.lastTimeReadISO || ""
                            }
                        }
                    });
                }
                else {
                    //use last read and fetch from the server directly
                    console.log("Planning to fetch items later than " + opts.lastTimeReadISO +
                        " from db (a total of " + msgMaxCapacity + "), then fill to capacity from front");
                    fetchedMsgs = await getManyMsgs(client_id, {
                        limit: opts.limit,
                        selector: {
                            "time_stamp_server_received": {
                                "$gt": opts.lastTimeReadISO || ""
                            }
                        }
                    });

                }
                // newRows = [...fetchedMsgs.docs, ...msgs.slice(opts.limit)];
            }
            else {
                console.log("Fill to capacity (from front) and from " + docsInCache.length);
                limit = msgMaxCapacity - docsInCache.length,
                    fetchedMsgs = await getManyMsgs(client_id, {
                        limit,
                        bookmark
                    });
                //newRows = [...fetchedMsgs.docs, ...msgs.slice(opts.limit)]
            }
            let { docs, ...restOf } = fetchedMsgs
            if (!docs || docs.length === 0) {
                console.log("fetch was empty")
                return fillState.empty;
            }
            newRows = [...docs, ...docsInCache]
            console.log("newRows as constituted: " + newRows.length);
            console.log("what's to be cleaved");
            console.log(newRows.slice(docsInCache.length ));
            newRows.length = msgMaxCapacity;
            console.log("newRows after cleave: " + newRows.length);
            clientData.docs = newRows;
            clientData = { ...clientData, ...restOf }
            console.log("Cache msgs (total of " + docs.length + ") for " + client_id)
            if (docs.length < limit) {
                console.log("partial")
                return fillState.partial;
            } else if (docs.length === limit) {
                console.log("whole")
                return fillState.filled;
            }
        }
    }
    //called once a socket is connected. Checks if client is exists in cache. 
    //if not, loads client data from DB
    async function primeClient(client_id, opts = {}) {
        try {
            let primed = false;
            let clientInCache = await findClientInCache(client_id, opts);
            console.log("in primeClient");
            if (!clientInCache) {
                console.log("Not found in cache.. going to db")
                console.log(opts)
                //fetch from DB
                let clientMsgs = await getManyMsgs(client_id, { limit: msgMaxCapacity, skip: 0 });
                if (clientMsgs.docs) {
                    console.log("clientMsgs: " + clientMsgs.docs.length);
                    //add to cache
                    //log(hkk)
                    await createOrUpdateCacheFromDB(client_id, clientMsgs)
                    let indexOf = findIndexClient(client_id)
                    console.log("count in cache: " + backUpChats[indexOf].docs.length);
                } else {
                    console.log("Empty...")
                }
            } else {
                console.log("Found in cache")
            }
            primed = clientExistsInCache(client_id);
        } catch (error) {
            console.log(error)
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
        let indexPos = findIndexClient(client_id);
        //create new clientData
        let { docs: docsFromServer, ...restOf } = data
        if (!Number.isInteger(indexPos)) {
            console.log("inside....");
            if (backUpChats.length > 100) {
                backUpChats[0].docs = []
            }
            //create in a fresh spot
            else {
                console.log("Creating updatable...");
                let metaData = cacheItemMetaManager(client_id, { action: "update" });
                let index = backUpChats.push({ ...metaData, ...data }) - 1;
                console.log("backUpChats: " + backUpChats[index].docs.length)
                indexer(client_id, index)
                addedToCache = true;
            }
        }
        //update db then cache
        else {
            console.log("outside....")
            let docs = backUpChats[indexPos].docs || []
            let metaData = cacheItemMetaManager(client_id, { action: "create" });
            console.log("doc count...." + docs.length)
            console.log("docsFromServer count...." + docsFromServer.length)
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
            let index = findIndexClient(client_id);
            if (!index) {
                return
            }
            if (updateCache) {
                console.log("DB updated...")
                let dataUpdated = { _rev, _id, ...rest }
                backUpChats[index].docs.push(dataUpdated);
            } else {
                console.log("Cache not updated...")
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
        let index = findIndexClient(client_id)
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
            let clientData = await findClientInCache(client_id, opts);
            if (!clientData) {
                console.log("Client has thrashed. Looking up in DB.");
                let { lastTimeReadISO = "", limit, } = opts
                let freshFromDB = await getManyMsgs(client_id, {
                    limit,
                    selector: {
                        "recipient_id": client_id,
                        "time_stamp_server_received": {
                            "$gt": lastTimeReadISO
                        }
                    }
                });
                if (freshFromDB.docs && freshFromDB.docs.length) {
                    await createOrUpdateCacheFromDB(client_id, freshFromDB);
                    clientData = await findClientInCache(client_id, opts)
                } else {
                    console.log("empty freshFromDB")
                }
            }
            return clientData
        } catch (error) {
            console.log(error)
        }
    }


    return {
        primeClient, createOrUpdateCacheFromDB, updateSyncCache, backUpChats,
        findClientMsgs, updateDBThenClient, saveToDBThenClient,
        fillClientCacheFromFront
    }
}

module.exports = { myCache }



