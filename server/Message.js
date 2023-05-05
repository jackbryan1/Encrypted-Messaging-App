const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    to: String,
    from: String,
    date: String,
    message: Object,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;