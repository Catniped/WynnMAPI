terrDataFile = require('./data/territories.js');

class Territory {
  constructor() {
    this.name;
    this.guild;
    this.guildTag;
    this.emProd;
    this.emStorage;
    this.oreProd;
    this.oreStorage;
    this.woodProd;
    this.woodStorage;
    this.fishProd;
    this.fishStorage;
    this.cropProd;
    this.cropStorage;
    this.treasury;
    this.defences;
    this.conns;
    this.location;
    this.acquired;
    this.guildColor;
  }
}

function dummyData() {
  var terr = new Territory;
  terr.name = "Ragni Main Entrance"
  terr.guild = "empire of"
  terr.guildTag = "E"
  terr.emProd = "9000"
  terr.emStorage = "100/5387"
  terr.oreProd = "3600"
  terr.oreStorage = "26/5327"
  terr.woodProd = "3600"
  terr.woodStorage = "53/5325"
  terr.fishProd = "3600"
  terr.fishStorage = "130/5353"
  terr.cropProd = "3600"
  terr.cropStorage = "432/5353"
  terr.treasury = "Low"
  terr.defences = "Very High"
  terr.conns = ["Ragni"]
  terr.location = {startX: 1000, startZ: 1000, endX: 0, endZ: 0}
  terr.acquired = "im not gonna bother"
  terr.guildColor = "#ccccff"
  var terr2 = structuredClone(terr);
  terr2.location = {startX: 1500, startZ: 1500, endX: 1000, endZ: 1000}
  terr2.name = "Ragni"
  terr2.conns = ["Ragni Main Entrance"]
  return([terr2,terr])
};

function genHybridData(achievementData, apiData) {
  let apiTerrs = apiData.data.territories;
  let mapDataObj = JSON.parse(achievementData);
  let terrs = [];
  for (terrNum = 1; terrNum < mapDataObj.advancementMapping.length; terrNum++) {
    let terrName = mapDataObj.advancementMapping[terrNum].value.displayData.title.replace(new RegExp("[{}\":]|text", 'g'), '').trim();
    if (terrName) {
      let terr = new Territory();
      let terrDesc = mapDataObj.advancementMapping[terrNum].value.displayData.description;
      
      terr.name = terrName;
      terr.guild = apiTerrs[terrName].guild;
      terr.guildTag = apiTerrs[terrName].guildPrefix;
      terr.acquired = apiTerrs[terrName].acquired;
      terr.guildColor = apiTerrs[terrName].guildColor;

      terr.conns = terrDesc.substr(terrDesc.search(new RegExp("Trading Routes:", 'g'))+15).replace(new RegExp("[}\"]", 'g'),"").split("\\n§f- §7");
      terr.conns.shift();
      let terrLoc = apiTerrs[terrName].location;
      terr.location = {startX: terrLoc.startX, startZ: terrLoc.startZ, endX: terrLoc.endX, endZ: terrLoc.endZ};
      
      if (terrDesc.match(new RegExp("\\[(.*?)\\]", 'g'))[0].replace(new RegExp("[\\[\\]']", 'g'),"") != terr.guildTag) {terrs.push(terr); continue;}

      // non-api

      let terrStatsResRaw = terrDesc.replace(new RegExp("[A-z{} \":-]", 'g'),"").trim().toString();
      let def_treasury = terrDesc.match(new RegExp("Very Low|Low|Medium|High|Very High", 'g'));
      terr.treasury = def_treasury[0];
      terr.defences = def_treasury[1];
      
      let parseState;
      let numBuffer = "";
      let bufferState;

      for (const char of terrStatsResRaw) {
        switch(char) {
          case "Ⓑ": // ore
            bufferState = 0;
            parseState = 1;
            numBuffer = "";
            break;
          case "Ⓒ": // wood
            bufferState = 0;
            parseState = 2;
            numBuffer = "";
            break;
          case "Ⓚ": // fish
            bufferState = 0;
            parseState = 3;
            numBuffer = "";
            break;
          case "Ⓙ": // crops
            bufferState = 0;
            parseState = 4;
            numBuffer = "";
            break;
          case "+":
            bufferState = 1;
            break;
          case "/":
            bufferState = 2;
            numBuffer = numBuffer.concat("", "/");
            break;
          case "§":
            switch (bufferState) {
              case 1:
                switch (parseState) {
                  case 1:
                    terr.oreProd = numBuffer;
                    break;
                  case 2:
                    terr.woodProd = numBuffer;
                    break;
                  case 3:
                    terr.fishProd = numBuffer;
                    break;
                  case 4:
                    terr.cropProd = numBuffer;
                    break;
                  default:
                    terr.emProd = numBuffer;
                    break;
                }
                break;

              case 2:
                switch (parseState) {
                  case 1:
                    terr.oreStorage = numBuffer;
                    break;
                  case 2:
                    terr.woodStorage = numBuffer;
                    break;
                  case 3:
                    terr.fishStorage = numBuffer;
                    break;
                  case 4:
                    terr.cropStorage = numBuffer;
                    break;
                  default:
                    terr.emStorage = numBuffer;
                    break;
                }
                break;

            }
            
            bufferState = 0;
            parseState = 0;
            numBuffer = "";
            break;

          default:
            numBuffer = numBuffer.concat("", char);
            break;
        }
      }

      terrs.push(terr);
    }}

  return(terrs);
};

function genApiData(apiData) {
  let apiTerrs = apiData.data.territories;
  let terrs = [];
  for (terrNum = 1; terrNum < apiTerrs.length; terrNum++) {
    let terr = new Territory();
    
    terr.name = apiTerrs[terrNum].name;
    terr.guild = apiTerrs[terrNum].guild;
    terr.guildTag = apiTerrs[terrNum].guildPrefix;
    terr.acquired = apiTerrs[terrNum].acquired;
    terr.guildColor = apiTerrs[terrNum].guildColor;

    terr.conns = terrDataFile.territoryData[terrName].connections;
    let terrLoc = apiTerrs[terrName].location;
    terr.location = {startX: terrLoc.startX, startZ: terrLoc.startZ, endX: terrLoc.endX, endZ: terrLoc.endZ};
    
    terrs.push(terr);
  }};

exports.genHybridData = genHybridData;
exports.genApiData = genApiData;
exports.dummyData = dummyData;