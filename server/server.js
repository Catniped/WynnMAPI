const fs = require("node:fs");
const axios = require("axios");
const parser = require("./parser.js");
const express = require("express");
const helmet = require("helmet");
const ratelimit = require("express-rate-limit");

const app = express();
const port = 3000;

const limiter = ratelimit.rateLimit({windowMs: 60000, limit: 60})
app.use(limiter);
app.use(helmet());

app.get('/hybridData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
    axios.get('https://athena.wynntils.com/cache/get/territoryList').then(response => {
        let mapData = fs.readFileSync("./data/map1.json", 'utf8');
        res.header("Access-Control-Allow-Origin", "*");
        res.send(parser.genHybridData(mapData, response));
    })} catch {
        res.status(503).send("Could not fetch API data from Athena.");
    };
});

app.get('/apiData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
    axios.get('https://athena.wynntils.com/cache/get/territoryList').then(response => {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(parser.genApiData(response));
    })} catch {
        res.status(503).send("Could not fetch API data from Athena.");
    }
});

app.get('/dummyData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(parser.dummyData());
});

app.listen(port, () => {
    console.log(`Started app on port ${port}`)
});
