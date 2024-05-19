const fs = require('node:fs');
const axios = require("axios");
const parser = require("./parser.js");
const express = require('express');

const app = express();
const port = 3000;

app.get('/hybridData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    axios.get('https://athena.wynntils.com/cache/get/territoryList').then(response => {
        let mapData = fs.readFileSync("./map1.json", 'utf8');
        res.header("Access-Control-Allow-Origin", "*");
        res.send(parser.genHybridData(mapData, response));
    });
});

app.get('/apiData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    axios.get('https://athena.wynntils.com/cache/get/territoryList').then(response => {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(parser.genApiData(response));
    });
});

app.get('/dummyData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(parser.dummyData());
});

app.listen(port, () => {
    console.log(`Started app on port ${port}`)
});
