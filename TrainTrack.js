const express = require("express");
const bodyParser = require("body-parser");
const amtrak = require("amtrak");
const path = require("path");
const router = express.Router();
require("dotenv").config({
  path: path.resolve(__dirname, "credentialsDontPost/.env"),
});
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

async function insert(passenger) {
  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);
    await collection.insertOne(passenger);
  } catch (e) {
    console.error(e);
  }
}

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

router.get("/adminTrain", (request, response) => {
  displayAdminTrains().then((result) => {
    const variable = { table: result };
    response.render("adminTrain", variable);
  });
});

router.use(bodyParser.urlencoded({ extended: false }));

router.get("/adminPassenger", (request, response) => {
  response.render("adminPassenger", null);
});

router.post("/passengerInfo", (request, response) => {
  const email = request.body.email;
  displayPassengerInfo(email).then((result) => {
    const variable = { table: result };
    response.render("passengerInfo", variable);
  });
});

router.post("/confirmation", (request, response) => {
  verifyTrain(request.body.train).then(valid => {
    if (valid){
    const reservation = {
      name: request.body.firstName,
      email: request.body.email,
      passengerCount: request.body.passengerCount,
      train: request.body.train,
      luggageCount: request.body.luggageCount,
      description: request.body.description
    };
    insert(reservation);
    response.render("confirmation", reservation);
    } else {
      const reservation = {
        name: "NONE",
        email: "NONE",
        passengerCount: "NONE",
        train: "Invalid Train Selected. Please Try Booking Again",
        luggageCount: "NONE",
        description: "NONE"
      };
      response.render("confirmation", reservation);
    }
  }).catch(error => console.error(error));
});

async function verifyTrain(target){
  let arr = await getTrainData();
  return !Number.isNaN(target) && arr.some(elem => elem.trainNum === target);
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

async function displayAdminTrains() {
  let table =
    "<table border = '1'><tr><th>Route Name</th><th>Train Number</th><th>Origin</th><th>Destination</th><th>Scheduled Departure Time From New Carrollton</th><th>Passenger Count</th><th>Luggage Count</th></tr>";
  let trainData = await getTrainData();
  trainData.sort((train1, train2) => new Date(train1.departure) - new Date(train2.departure));
  await client.connect();
  const database = client.db(databaseName);
  const collection = database.collection(collectionName);
  for (let i = 0; i < trainData.length; i++){
    let train = trainData[i];
    let filter = { train: train.trainNum };
    const cursor = await collection.find(filter);
    let arr = await cursor.toArray();
    let pax = 0, luggage = 0;
    for(j = 0; j < arr.length; j++){
      pax += Number(arr[j].passengerCount);
      luggage += Number(arr[j].luggageCount);
    }
    table += `<tr><td>${train.routeName}</td><td>${train.trainNum}</td><td>${train.origName}</td><td>${train.destName}
    </td><td>${train.departure}</td><td>${pax}</td><td>${luggage}</td></tr>`;
  }
    return table;
}

async function displayPassengerInfo(email) {
  let table =
    "<table border = '1'><tr><th>Name</th><th>Train Number</th><th>Passenger Count</th><th>Luggage Count</th><th>Description</th></tr>";
  await client.connect();
  const database = client.db(databaseName);
  const collection = database.collection(collectionName);
  let filter = { email: email };
  const data = await collection
        .find(filter)
        .toArray();

  for (let i = 0; i < data.length; i++){
    let item = data[i];
    table += `<tr><td>${item.name}</td><td>${item.train}</td><td>${item.passengerCount}</td><td>${item.luggageCount}
    </td><td>${item.description}</td></tr>`;
  }
  table += "</table>";
  return table;
}

module.exports = router;
