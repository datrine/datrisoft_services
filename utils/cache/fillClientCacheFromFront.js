let { myCache, cacheSettings, dbFns } = require("./index");

/**
 * 
 * @param {*} clientCache 
 * @param {*} client_id 
 * @param {*} opts 
 */
async function fillClientCacheFromFront(clientCache, client_id, opts = {
    limit: 5, leadingRev: "", earliestTimeReadISO:""
}) {
    let { msgMaxCapacity } = cacheSettings;
    let { getManyMsgs } = dbFns;
    let fillState = {
        empty: 0,
        partial: 1,
        filled: 2
    }
    if (!clientCache) {
        throw "Client does not exist in cache."
    }
    let limit = opts.limit < msgMaxCapacity ? opts.limit : Math.floor((msgMaxCapacity / 4) * 3);
    let fetchedMsgs;
    let bookmark = clientCache.bookmark;
    let docsInCache = clientCache.docs;
    let newRows = []
    if (docsInCache.length >= msgMaxCapacity) {
        //find index of the last item read
        let lastReadItemIndex = docsInCache.findIndex(item =>
            item.time_stamp_server_received === opts.earliestTimeReadISO);
        //if not found
        if (lastReadItemIndex > -1) {
            limit = msgMaxCapacity;
            fetchedMsgs = await getManyMsgs(client_id, {
                limit: msgMaxCapacity,
                selector: {
                    limit,
                    "time_stamp_server_received": {
                        "$gt": opts.earliestTimeReadISO || "",

                    }
                }
            });
        }
        //if found
        else {
            //use last read (earliestTimeReadISO) as the lower limit 
            fetchedMsgs = await getManyMsgs(client_id, {
                limit: opts.limit,
                selector: {
                    "time_stamp_server_received": {
                        "$gt": opts.earliestTimeReadISO || ""
                    }
                }
            });
        }
        // newRows = [...fetchedMsgs.docs, ...msgs.slice(opts.limit)];
    }
    else {
        limit = msgMaxCapacity - docsInCache.length;
        fetchedMsgs = await getManyMsgs(client_id, {
            limit,
            bookmark
        });
    }
    let { docs, ...restOf } = fetchedMsgs
    if (!docs || docs.length === 0) {
        return {clientCache,fillState:0};
    }
    //merge newly fetched docs and old docs already in cache into 'newRows', with new docs in front;
    newRows = [...docs, ...docsInCache]
    //clip off 'newRows' and replace current docs in cache with 'newRows'
    newRows.length = msgMaxCapacity;
    clientCache.docs = newRows;
    clientCache = { ...clientCache, ...restOf }
    if (docs.length < limit) {
        return { clientCache, fillState: 1 };
    } else if (docs.length === limit) {
        return { clientCache, fillState: 2 };
    }

}
module.exports = fillClientCacheFromFront