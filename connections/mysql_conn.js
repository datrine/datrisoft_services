const knex= require("knex")({
    client: 'mysql',
    connection: {
      host : 'eel.whogohost.com',
      user : 'stylezns_datrine',
      password : 'TeMi4ToPe',
      database : 'stylezns_datrisoft_db'
    }
  });

  knex.schema.hasTable("jwt_tbl").then(function (exists) {
    if (!exist) {
       return knex.schema.createTable("jwt_tbl",function (tableBuilder) {
            tableBuilder.json("redirect_urls");
            tableBuilder.uuid("")
            tableBuilder.string("client_secret")
        })
    }

    console.log("Table exists...")
})

  knex.schema.hasTable("ouath").then(function (exists) {
      if (!exist) {
         return knex.schema.createTable("ouath",function (tableBuilder) {
              tableBuilder.json("redirect_urls");
              tableBuilder.uuid("")
              tableBuilder.string("client_secret")
          })
      }

      console.log("Table exists...")
  })

  module.exports=knex;