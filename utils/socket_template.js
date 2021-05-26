let generalTemplate = {
    reciepient_id: "myspace4you",
    type_of_receiver: "client",
    type_of_msg: "text",
    msg: "",
    time_stamp_sent: new Date().toISOString()
}

let clientChatTemplate = {
    ...generalTemplate
}

let notificationTemplate = {
    ...generalTemplate
}

let serverMeta = {
    time_stamp_server_received: new Date().toISOString()
}

module.exports = { clientChatTemplate, notificationTemplate, serverMeta }