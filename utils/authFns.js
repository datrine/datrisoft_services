const knex=require("../connections/mysql_conn")
var getClient = function (clientId) {
    if (true) {
        knex().where({
            client_id:clientId
        }).then((results)=>{
            if (results.length>0) {
                return results[0];
            }
        })
    }
    return  __.find(clients, function (client) {
        return client.client_id ==
            clientId;
    });
};

module.exports = { getClient };