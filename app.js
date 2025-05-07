const express = require("express");
const app = express();
const path = require("path");
const portNumber = 5001;
const trainTrack = require("./TrainTrack");

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use("/", trainTrack);

process.stdin.setEncoding("utf8");
app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
  const input = process.stdin.read();
  if (input !== null) {
    const command = input.trim();
    if (command === "stop") {
      process.stdout.write("Shutting down the server\n");
      (async () => await client.close())();
      process.exit(0);
    } else {
      process.stdout.write(`Invalid command: ${command}\n`);
    }
    process.stdout.write(prompt);
    process.stdin.resume();
  }
});
