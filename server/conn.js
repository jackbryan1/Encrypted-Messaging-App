const mongoose = require("mongoose");
const Db = process.env.ATLAS_URI;

module.exports = {
    connectToServer: async function () {
        await mongoose.connect(Db);
    },
};
