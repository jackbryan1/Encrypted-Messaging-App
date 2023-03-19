const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const mongoose = require("mongoose");

app.listen(port, () => {console.log(`Server is running on port: ${port}`);});

mongoose.connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Database connected!"))
    .catch(err => console.log(err));

app.use(require("./record"));
