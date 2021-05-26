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
    let res = await (await connection).db.insert(doc, id)
    return res;
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
async function getManyMsgs(client_id, opts) {
    let res = await (await connection).db
        .find({ selector: { "reciepient_id": client_id, }, ...opts })
    /**
     * @type {nano.MangoResponse<any>}
     */
    let storedMsgMeta = res.docs
    
    return storedMsgMeta;
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