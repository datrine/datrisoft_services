let { myCache, cacheSettings, dbFns } = require("./index");
/**
 * 
 * @param {*} client_id 
 * @param {object} opts 
 * @param {number} opts.limit
 * @param {string} opts.earliestId
 * @param {string} opts.earliestTimeReadISO
 * @param {string} opts.latestId
 * @param {string} opts.latestTimeReadISO
 * @template {{}} K
 * @returns {{clientCache:{},outOfRange: false,boundaries:{isLeftLimitOutOfUpperRange:boolean,isRightLimitOutOfLowerRange:boolean,isRightLimitOutOfUpperRange:boolean}}}
 */
async function findClientInCache(client_id, opts = {}) {
    try {

        let { earliestId = "", earliestTimeReadISO = "", latestId = "", latestTimeReadISO = "",
            limit = 2, } = opts;
        let { msgMaxCapacity } = cacheSettings;
        let arrayPos = myCache.findClientIndex(client_id);
        if (!Number.isInteger(arrayPos)) {
            return null
        }
        let itemInCache = myCache.backUpChats[arrayPos];
        let itemToReturn;
        let docs = itemInCache.docs
        let isRightLimitOutOfUpperRange = false;
        let isRightLimitOutOfLowerRange = false;
        let isLeftLimitOutOfLowerRange = false;
        let isLeftLimitOutOfUpperRange = false;
        if (latestTimeReadISO || earliestTimeReadISO) {
            if (latestTimeReadISO && earliestTimeReadISO &&
                (new Date(earliestTimeReadISO) > new Date(latestTimeReadISO))) {
                throw "Earliest date cannot be greater than latest date"
            }
            let indexOfEarliestRead =
                docs.findIndex(item => item._id === earliestId &&
                    item.time_stamp_server_received === earliestTimeReadISO);
            if (indexOfEarliestRead === -1) {
                isRightLimitOutOfUpperRange = new Date(earliestTimeReadISO) <
                    new Date(docs[docs.length - 1].time_stamp_server_received);
                isLeftLimitOutOfUpperRange = new Date(latestTimeReadISO) <
                    new Date(docs[docs.length - 1].time_stamp_server_received);
            }
            let indexOfLatestRead =
                docs.findIndex(item => item._id === latestId &&
                    item.time_stamp_server_received === latestTimeReadISO);
            if (indexOfLatestRead === -1) {
                isLeftLimitOutOfLowerRange = new Date(latestTimeReadISO) >
                    new Date(docs[0].time_stamp_server_received);
                isRightLimitOutOfLowerRange = new Date(earliestTimeReadISO) >
                    new Date(docs[0].time_stamp_server_received);
            }
            if (isLeftLimitOutOfUpperRange || isRightLimitOutOfLowerRange) {
                itemToReturn = {
                    clientCache: { ...itemInCache, docs: [] },
                    outOfRange: true,
                    boundaries: {
                        isLeftLimitOutOfLowerRange,
                        isLeftLimitOutOfUpperRange,
                        isRightLimitOutOfLowerRange, isRightLimitOutOfUpperRange
                    }
                }
            } else {
                let startIndex = 0;
                let endIndex = 0;
                if (indexOfEarliestRead > -1) {
                    endIndex = indexOfEarliestRead - 1;
                    startIndex = Math.max(endIndex - limit, 0);
                    docs = docs.slice(startIndex, endIndex);
                }
                else if (indexOfLatestRead > -1) {
                    startIndex = indexOfLatestRead + 1;
                    endIndex = Math.min(startIndex + limit, docs.length);
                    docs = docs.slice(startIndex, endIndex);
                } else {
                    console.log("This is a dead end...")
                }
                itemToReturn = {
                    clientCache: { ...itemInCache, docs },
                    outOfRange: false,
                    boundaries: {
                        isLeftLimitOutOfLowerRange,
                        isLeftLimitOutOfUpperRange,
                        isRightLimitOutOfLowerRange,
                        isRightLimitOutOfUpperRange
                    }
                }
            }

        } else if (limit) {
            let endIndex = docs.length;
            let startIndex = Math.min(endIndex - limit, 0);
            docs = docs.slice(startIndex, endIndex);
            itemToReturn = {
                clientCache: { ...itemInCache, docs },
                outOfRange: false,
                boundaries: {
                    isLeftLimitOutOfLowerRange: (endIndex - limit >= 0),
                    isLeftLimitOutOfUpperRange,
                    isRightLimitOutOfLowerRange,
                    isRightLimitOutOfUpperRange
                }
            }
        }
        else {
            //if no limiting conditions in the opts variable
            itemToReturn = {
                clientCache: { ...itemInCache },
                outOfRange: false,
                boundaries: {
                    isLeftLimitOutOfLowerRange,
                    isLeftLimitOutOfUpperRange,
                    isRightLimitOutOfLowerRange,
                    isRightLimitOutOfUpperRange
                }
            }
        }
        return itemToReturn
    } catch (error) {
        console.log(error)
    }
}

module.exports = findClientInCache;