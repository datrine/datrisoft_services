const { getCloudant, getCloudantDB, getCloudantDoc } = require("../services/dbs/cloudant_db");
var Cloudant = require('@cloudant/cloudant');
const { chatTemplate, serverMeta } = require("./socket_template");
var nano = require("nano");

/**
 * @type {Cloudant.ServerScope}
 */
let cloudant;
/**
 * @type {nano.DocumentScope}
 */
let nuntius;
let connManager = async () => {
    let state = {
        initial: 0,
        connected: 1,
        failed: 2,
        current: undefined,
        connecting: 3,
        setCurrent(state) {
            this.current = state
        }
    }
    if (!nuntius) {
        state.setCurrent(state.initial);
        let prom = await getCloudantDB("nuntius");
        const indexDef = {
            index: { fields: ['recipient_id'] },
            name: 'recipientId'
        };
        //const res = await prom.createIndex(indexDef)
        //console.log(res);
        state.setCurrent(state.connected)
        //console.log(await prom.info())
        return { db: prom, connState: state.current }
    } else {
        state.setCurrent(state.connected)
        return { db: nuntius, connState: state.current }
    }
}

let connection = connManager();

let model = {
    socket_ids: []
}

/**
 * @type {[model]}
 */
let storedMsgModel = [model]

/**
 * 
 * @param {string} id 
 * @returns {Promise< nano.DocumentInsertResponse>}
 */
async function saveMsg(doc, id) {
    try {
        let res = await (await connection).db.insert(doc, id)
        return res;
    } catch (error) {
        console.log(error)
    }
}


/**
 * 
 * @param {string} rev 
 * @returns {Promise< nano.DocumentInsertResponse>}
 */
async function updateMsg(doc) {
    //update doc
    let res = await (await connection).db.insert(doc)
    return res;
}

/**
 * 
 * @param {string} id 
 * @returns {Promise<model>}
 */
async function getMsg(id) {
    /**
     * @type {model}
     */
    let storedMsg = await (await connection).db.get(id)
    return storedMsg;
}

/**
 * 
 * @param {string} id 
 * @param {{limit:number,skip:number ,bookmark:string}} opts 
 * @returns {Promise<nano.MangoResponse<any>>}
 */
async function getManyMsgs(client_id, opts = {}) {
    console.log("opts in getManyMsgs...")
    console.log(opts)
    console.log("opts in getManyMsgs...")
    let { earliestId, earliestTimeReadISO, ...restOf } = opts
    let res = await (await connection).db
        .find({
            selector: {
                "recipient_id": client_id,
            }, ...restOf,
            sort: [
                {
                    "time_stamp_server_received": "asc"
                }
            ],
        });
    if (res.docs.length>0) {
        console.log("Doc count: " + res.docs.length);
        console.log("Leading id: " + res.docs[0]._id);
        let docs = [...res.docs].reverse()
        res.docs = docs
        docs.map(item => console.log(item._id))
        /**
         * @type {nano.MangoResponse<any>}
         */
        let storedMsgMeta = res
        return storedMsgMeta;
    }else{
        console.log("Doc count is zero.");
        return []
    }
}


/**
 * 
 * @param {string} id 
 * @returns {Promise<[string]>}
 */
async function getManyRevIds(client_id) {
    let res = await nuntius.find({ selector: { "client_id": client_id, }, fields: ["_rev"] })
    let storedIds = res.docs
    return storedIds;
}

module.exports = { storedMsgModel, getMsg, saveMsg, updateMsg, getManyMsgs };