const fs = require('node:fs');

class Territory {
  constructor() {
    this.name;
    this.guild;
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
  }
}

fs.readFile('C:\\Users\\PC\\Documents\\GitHub\\WynnMAPI\\map1.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  
  let mapDataObj = JSON.parse(data);
  let terrs = [];
  for (terrNum = 1; terrNum < mapDataObj.advancementMapping.length; terrNum++) {
    let terrName = mapDataObj.advancementMapping[terrNum].value.displayData.title.replace(new RegExp("[{}\":]|text", 'g'), '').trim();
    if (terrName) {
      let terr = new Territory();
      let terrDesc = mapDataObj.advancementMapping[terrNum].value.displayData.description;
      let terrStatsResRaw = terrDesc.replace(new RegExp("[A-z{} \":-]", 'g'),"").trim().toString();
      let def_treasury = terrDesc.match(new RegExp("Very Low|Low|Medium|High|Very High", 'g'));
      let temp = terrDesc.search(new RegExp("Trading Routes:", 'g'));
      
      terr.name = terrName;
      terr.guild = terrDesc.match(new RegExp("\\[(.*?)\\]", 'g'))[0].replace(new RegExp("[\\[\\]']", 'g'),"");
      terr.treasury = def_treasury[0];
      terr.defences = def_treasury[1];
      terr.conns = terrDesc.substr(temp+15).replace(new RegExp("[}\"]", 'g'),"").split("\\n§f- §7");
      terr.conns.shift();

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

  console.log(terrs);
  
});


