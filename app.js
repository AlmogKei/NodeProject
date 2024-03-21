const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
require("./db/mongoConnect")
const {routesInit} = require("./routes/configRoutes")

const app = express();

app.use(cors())

app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));

routesInit(app);

const server = http.createServer(app);
server.listen(3001);
