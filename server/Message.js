const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    to: String,
    from: String,
    preKey: Boolean,
    message: Object,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;