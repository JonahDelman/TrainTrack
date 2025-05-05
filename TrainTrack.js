const express = require("express");
const bodyParser = require("body-parser");
const amtrak = require("amtrak");
const app = express();
const path = require("path");
const portNumber = 5001;

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
app.get("/", (request, response) => {
  response.render("index", null);
});

app.get("/viewTrains", (request, response) => {
  displayTrains().then((result) => {
    const variable = { table: result };
    response.render("viewTrains", variable);
  });
});

async function displayTrains() {
  let table =
    "<table border = '1'><tr><th>Route Name</th><th>Train Number</th><th>Origin</th><th>Destination</th><th>Scheduled Departure Time</th></tr>";
  let station = await amtrak.fetchStation("NCR");
  for (let i = 0; i < station.NCR.trains.length; i++) {
    const id = station.NCR.trains[i];
    let trainData = await amtrak.fetchTrain(id);
    const trains = Object.values(trainData);
    const train = trains[0][0];
    const departure = new Date(
      train.stations.find((station) => station.name === "New Carrollton").schDep
    ).toString();
    let currTime = new Date().toString();
    if (departure > currTime) {
      table += `<tr><td>${train.routeName}</td><td>${train.trainNum}</td><td>${train.origName}</td><td>${train.destName}
          </td><td>${departure}</td></tr>`;
    }
  }
  return table;
}
