const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connection = require("./conn/connection.js");
const router = require("./routes/routes.js");
const request = require("request");
// const conn = require("./conn/conn");
require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(express.json());

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 4000;

app.use("/", router);

app.listen(port, () => {
  console.log(`App is listening on port ${port}!`);
});
