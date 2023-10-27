//Imports
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const { join } = require("path");
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const extractTextFromDoc = require("./extractTextFromDoc");
// const bodyParser = require("body-parser");

const PORT = process.env.PORT || 4000;

//****************** APP ***************************//
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "..", "client", "build")));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
const httpServer = createServer(app); //my http server
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
  },
}); //Web socket server

//***************** Endpoint TWILIO ******************//
app.post("/api/twilio/messages", async (req, res) => {
  try {
    res.header("Content-Type", "application/json");
    await twilio.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: req.body.to,
      body: req.body.body,
    });
    res.send(JSON.stringify({ success: true }));
  } catch (err) {
    console.log(err);
    res.send(JSON.stringify({ success: false }));
  }
});
//****************************************************//

//**************** Endpoint DOCUMENT AI **************//
app.post("/api/extractToText", async (req, res) => {
  try {
    const { docUrl, mime } = req.body;
    const result = await extractTextFromDoc(docUrl, mime);
    res.send(result);
    res.send(JSON.stringify({ success: true }));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
    res.send(JSON.stringify({ success: false }));
  }
});

//****************************************************//

//*************** Endpoint to connect to Xano **********//
// Create a custom API endpoint to receive data
app.post("/xano-message", (req, res) => {
  // Extract the message from the request body
  const message = req.body;
  // Broadcast the message to all connected clients
  io.emit(`xano message`, message);
  // Respond to the HTTP request
  res.status(200).send("Message sent successfully");
});

//******************************************************/

//Dans les autres cas on renvoie la single page app
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "..", "client", "build", "index.html"));
});

//****************** SOCKET CONECTION/DECONNECTION EVENT LISTENERS ****************//

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.id} disconnected`);
    console.log(reason);
  });
  socket.on("message", (message) => {
    io.emit("message", message);
  });
});
io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

//*******************************************************************//

httpServer.listen(PORT, () => {
  console.log(`Le serveur est lancé sur le port ${PORT}`);
});
