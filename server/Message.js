const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    to: String,
    from: String,
    date: String,
    type: Number,
    message: Object,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;