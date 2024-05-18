const fs = require('node:fs');
const axios = require("axios");
const parser = require("./parser.js");
const express = require('express');

const app = express();
const port = 3000;

let mapData = fs.readFileSync("./map1.json", 'utf8');

app.get('/hybridData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(parser.test());
    /*axios.get('https://athena.wynntils.com/cache/get/territoryList').then(response => {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(parser.genHybridData(mapData, response));
    });*/
});

app.listen(port, () => {
    console.log(`Started app on port ${port}`)
});
