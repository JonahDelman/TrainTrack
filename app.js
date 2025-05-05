const express = require("express");
const app = express();
const path = require("path");
const portNumber = 5001;
const trainTrack = require("./TrainTrack");

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use("/", trainTrack);

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
