const endpoint = "https://wynnmapi.azurewebsites.net/"

document.addEventListener('DOMContentLoaded', function () {
  var CRSPixel = L.Util.extend(L.CRS.Simple, {
    transformation: new L.Transformation(1,0,1,0)
  });

  var terrPolygon = L.Util.extend(L.polygon, {terrObj: undefined});

  var map = L.map('map', {
    crs: CRSPixel,
    attributionControl: false,
    minZoom: -3,
    maxZoom: 0
  });

  // terrinfo control
  var terrInfo = L.control({position: "topright"});

  function getDifficultyColor(difficulty) {
    switch (difficulty) {
      case "Very Low": return "#009933"
      case "Low": return "#33ff77"
      case "Medium": return "#ffff00"
      case "High": return "#ff3300"
      case "Very High": return "#801a00"
      default: return "#ffffff"
    }
  };

  function getTimeDelta(t) {
    let delta = Date.now() - t.getTime();

    let days = Math.floor(delta / (1000 * 60 * 60 * 24));
    let hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((delta % (1000 * 60)) / 1000);

    return(`${days ? `${days}d` : ""} ${hours ? `${hours}h` : ""} ${minutes ? `${minutes}m` : ""} ${seconds ? `${seconds}s` : ""}`)
  };

  var terrData;

  terrInfo.update = function () {
    terrInfo._div.innerHTML = 
    terrData ? `<h1>${terrData.name}</h1>\
    <h2 style="-webkit-text-fill-color: ${terrData.guildColor}">${terrData.guild} [${terrData.guildTag}]</h2>\
    ${terrData.emProd ? `<h2 style="-webkit-text-fill-color: #39ac39">+${terrData.emProd} Emeralds</h2>` : ""}\
    ${terrData.emStorage ? `<h2 style="-webkit-text-fill-color: #39ac39">${terrData.emStorage} Emeralds Stored</h2>` : ""}\
    ${terrData.oreProd ? `<h2 style="-webkit-text-fill-color: #f2f2f2">+${terrData.oreProd} Ore</h2>` : ""}\
    ${terrData.oreStorage ? `<h2 style="-webkit-text-fill-color: #f2f2f2">${terrData.oreStorage} Ore Stored</h2>` : ""}\
    ${terrData.woodProd ? `<h2 style="-webkit-text-fill-color: #ff8c1a">+${terrData.woodProd} Wood</h2>` : ""}\
    ${terrData.woodStorage ? `<h2 style="-webkit-text-fill-color: #ff8c1a">${terrData.woodStorage} Wood Stored</h2>` : ""}\
    ${terrData.fishProd ? `<h2 style="-webkit-text-fill-color: #4d79ff">+${terrData.fishProd} Fish</h2>` : ""}\
    ${terrData.fishStorage ? `<h2 style="-webkit-text-fill-color: #4d79ff">${terrData.fishStorage} Fish Stored</h2>` : ""}\
    ${terrData.cropProd ? `<h2 style="-webkit-text-fill-color: #ffc34d">+${terrData.cropProd} Crops</h2>` : ""}\
    ${terrData.cropStorage ? `<h2 style="-webkit-text-fill-color: #ffc34d">${terrData.cropStorage} Crops Stored</h2>` : ""}\
    ${terrData.treasury ? `<h2>Treasury: <span style="-webkit-text-fill-color: ${getDifficultyColor(terrData.treasury)}">${terrData.treasury}</span></h2>` : ""}\
    ${terrData.defences ? `<h2>Defences: <span style="-webkit-text-fill-color: ${getDifficultyColor(terrData.defences)}">${terrData.defences}</span></h2>` : ""}\
    ${terrData.acquired ? `<h2>Time held: <span style="-webkit-text-fill-color: #cccccc">${getTimeDelta(new Date(terrData.acquired))}</span></h2>` : ""}\
    `: "";
  };

  var focused = "";

  function setData(e) {
    if (e.target.options.terrObj.name != focused) {focused = "";};
    terrData = e.target.options.terrObj;
    terrInfo.update();
  };

  function resetData(e) {
    if (!focused) {
      terrData = undefined;
      terrInfo.update();
    };
  };

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    focused = e.target.options.terrObj.name;
  };

  terrInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'terrInfo');
    return this._div;
  };

  terrInfo.addTo(map);

  //options control
  var optionsControl = L.control({position: "bottomleft"});

  optionsControl.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'optionsControl');
    this._div.innerHTML = `
    <input type="checkbox" id="treasury-colored" name="options" value="treasury-colored" />\
    <label for="treasury-colored">Color by Treasury</label>
    `
    return this._div;
  };

  optionsControl.addTo(map);
  
  var bounds = [[-6573,-2383], [-160,1650]];
  var image = L.imageOverlay('main-map.png', bounds).addTo(map);
 
  const urlParams = new URLSearchParams(window.location.search);
  var dataType = urlParams.get("data");

  dataType ? dataType = dataType : dataType = "apiData";

  function clearMap() {
    for(i in map._layers) {
        if(map._layers[i]._url != "main-map.png") {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
  }

  var apiResponse;

  function renderTerrs(treasuryColored) {
    let terrPolygons = {};
    terrs = apiResponse.data;
    // draw terr outlines
    for (i=0;i<terrs.length;i++) {
      let loc = terrs[i].location;
      let outline = new terrPolygon([[loc.startZ, loc.startX],[loc.startZ, loc.endX],[loc.endZ, loc.endX],[loc.endZ, loc.startX]], {color: treasuryColored ? getDifficultyColor(terrs[i].treasury) : terrs[i].guildColor, terrObj: terrs[i]});
      outline.on("mouseover", setData);
      outline.on("mouseout", resetData);
      outline.on("click", zoomToFeature);
      outline.addTo(map);
      terrPolygons[terrs[i].name] = outline;

      let gTagOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      gTagOverlay.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      gTagOverlay.setAttribute(`viewBox`, `0 0 ${Math.abs(loc.startX - loc.endX)} ${Math.abs(loc.startZ - loc.endZ)}`);
      gTagOverlay.innerHTML =`<text x="${Math.abs(loc.startX - loc.endX)*(0.04+(0.125*(4-terrs[i].guildTag.length)))}" y="${Math.abs(loc.startZ - loc.endZ)*0.6}" style="font: ${Math.min(Math.abs(loc.startX - loc.endX), Math.abs(loc.startZ - loc.endZ))*0.35}px Poppins; fill: ${treasuryColored ? "#ffffff" : terrs[i].guildColor};">${terrs[i].guildTag}</text>`
      L.svgOverlay(gTagOverlay, [[loc.startZ, loc.startX],[loc.endZ, loc.endX]]).addTo(map);
    }

    // draw conns
    let renderedConns = [];
    let terrPolygonsArray = Object.values(terrPolygons);
    for (i=0;i<terrPolygonsArray.length;i++) {
      for (p=0;p<terrPolygonsArray[i].options.terrObj.conns.length;p++) {
        if (!renderedConns.includes(terrPolygonsArray[i].options.terrObj.conns[p])) {
          L.polyline([terrPolygonsArray[i].getCenter(), terrPolygons[terrPolygonsArray[i].options.terrObj.conns[p]].getCenter()], {color: "white", weight: 1, opacity: 0.75}).addTo(map);
        }
        renderedConns.push(terrPolygonsArray[i].options.terrObj.name);
      } 
    }
  };
  
  function refresh() {
    axios.get(endpoint+dataType)
      .then(response => {
        apiResponse = response;
        renderTerrs();
    })};

  refresh();
  
  treasuryCheckbox = document.querySelector("#treasury-colored");
  treasuryCheckbox.addEventListener("change", () => {
    clearMap();
    renderTerrs(treasuryCheckbox.checked);
  });

  map.fitBounds(bounds);
  setInterval(terrInfo.update, 1000);
});