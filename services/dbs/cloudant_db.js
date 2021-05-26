// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');
var nano = require("nano");

// Initialize Cloudant with settings from .env
var url = "https://5c50c953-14b9-4f72-82a9-0067328c541c-bluemix.cloudantnosqldb.appdomain.cloud";
var username = "5c50c953-14b9-4f72-82a9-0067328c541c-bluemix";
var password = "TeMi4ToPe";

/**
 * @type {Cloudant.ServerScope}
 */
var cloudant;
let getCloudant = async () => {
    let prom = new Promise(
        /**
         * 
         * @param {(cloudant: Cloudant.ServerScope)=> Cloudant.ServerScope} res 
         * @param {*} rej 
         */
        (res, rej) => {
            Cloudant({
                url, plugins: {
                    iamauth: { iamApiKey: "vmwIr95ZwC4Z-ZBlAfqGRRLzRFS_RO4880qprmXr-Pp5" }
                }
            }, function (err, cloudant, pong) {
                (async () => {
                    try {
                        if (err) {
                            throw err
                        }
                        return res(cloudant);
                    } catch (error) {
                        console.log(error.reason)
                        rej(err)
                    }
                })();
            });
        });
    return prom;
}
nano.DatabaseGetResponse
/**
 * @return {Promise< nano.DocumentScope>}
 */
let getCloudantDB = async (dbname) => {
    let prom = new Promise(
        /**
         * 
         * @param {(cloudant: Cloudant.ServerScope)=> Cloudant.ServerScope} res 
         * @param {(err:Error)=>{}} rej 
         */
        (res, rej) => {
            (async () => {
                try {
                    cloudant = await getCloudant();
                    let listOfDB = await cloudant.db.list();
                    if (listOfDB.indexOf(dbname) === -1) {
                        console.log("DB does not yet existing.");
                        await cloudant.db.create(dbname)
                    }
                    console.log(listOfDB)
                    return res(cloudant.db.use(dbname));
                } catch (error) {
                    console.log(error.reason)
                    rej(error)
                }
            })();
        });
    return prom;
}

/**
 * @return {nano.Document}
 */
let getCloudantDocList = async (dbName, nameOfDoc) => {
    try {
        /**
         * @type {nano.Document}
         */
        let doc
        let db = await getCloudantDB(dbName);
        let listOfDocs = await (await db.list()).rows;
        if (listOfDocs.indexOf(nameOfDoc) !== -1) {
            db.insert()
        }
        return doc;
    } catch (error) {

    }
}

/**
 * @return {nano.Document}
 */
let getCloudantDoc = async (dbName, nameOfDoc) => {
    try {
        /**
         * @type {nano.Document}
         */
        let doc
        let db = await getCloudantDB(dbName);
        let listOfDocs = await (await db.list()).rows;
        if (listOfDocs.indexOf(nameOfDoc) !== -1) {
            db.insert()
        }
        return doc;
    } catch (error) {

    }
}

/**
 * @return {nano.DocumentInsertResponse}
 */
let saveOrUpdateCloudantDoc = async (dbName, nameOfDoc, docToSave) => {
    try {
        /**
         * @type {nano.Document}
         */
        let doc
        let db = await getCloudantDB(dbName, nameOfDoc);
        doc = getCloudantDoc(dbName, nameOfDoc);
        let res= await db.insert(docToSave);
        return res;
    } catch (error) {

    }
}

module.exports = { getCloudant, getCloudantDB, getCloudantDoc, saveOrUpdateCloudantDoc };
