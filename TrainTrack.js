const express = require("express");
const bodyParser = require("body-parser");
const amtrak = require("amtrak");
const path = require("path");
const router = express.Router();


router.get("/", (request, response) => {
  response.render("index", null);
});

router.get("/book", (request, response) => {
  response.render("book", null);
});

router.get("/viewTrains", (request, response) => {
  displayTrains().then((result) => {
    const variable = { table: result };
    response.render("viewTrains", variable);
  });
});


async function verifyForm(){
  const target = Number(document.querySelector("#train").value);
  let arr = await getTrainData();
  if (!Number.isNaN(target) && arr.some(elem => elem.trainNum === target)){
    return window.confirm(`Are you sure you want to submit your ticket reservation?\n
      Route Name: ${train.routeName}\n
      Number: ${train.trainNum}\n
      Origin: ${train.origName}\n
      Destination: ${train.destName}\n
      Departure Time: ${train.departure}`);
  } else {
    alert("Train Invalid");
    return false;
  }
}


async function displayTrains() {
  let table =
    "<table border = '1'><tr><th>Route Name</th><th>Train Number</th><th>Origin</th><th>Destination</th><th>Scheduled Departure Time From New Carrollton</th></tr>";
  let trainData = await getTrainData();
  trainData.sort((train1, train2) => new Date(train1.departure) - new Date(train2.departure));
  trainData.forEach(train => table += `<tr><td>${train.routeName}</td><td>${train.trainNum}</td><td>${train.origName}</td><td>${train.destName}
    </td><td>${train.departure}</td></tr>`);
    return table;
}


async function getTrainData(){
  const arr = new Array();
  let station = await amtrak.fetchStation("NCR");
  for (let i = 0; i < station.NCR.trains.length; i++) {
    const id = station.NCR.trains[i];
    let trainData = await amtrak.fetchTrain(id);
    const trains = Object.values(trainData);
    const train = trains[0][0];
    const departure = new Date(
      train.stations.find((station) => station.name === "New Carrollton").schDep
    );
    let currTime = new Date();
    if (departure > currTime) {
      train.departure = departure.toLocaleString();
      arr.push(train);
    }
  }

  return arr;
}

module.exports = router;
