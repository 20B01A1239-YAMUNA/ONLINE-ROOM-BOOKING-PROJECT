const mongoose = require("mongoose");

var mongoURL = "mongodb+srv://yamunasri_1239:cheapthrills@cluster0.yfpcbx1.mongodb.net/mern-rooms";

mongoose.connect(mongoURL, { useUnifiedTopology: true, useNewUrlParser: true });

var connection = mongoose.connection;

connection.on("error", () => {
  console.log("connection failed");
});

connection.on("connected", () => {
  console.log("connection successful");
});

module.exports = mongoose;
