const endpoint = "https://wynnmapi.azurewebsites.net/"

document.addEventListener('DOMContentLoaded', function () {
  var CRSPixel = L.Util.extend(L.CRS.Simple, {
    transformation: new L.Transformation(1,0,1,0)
  });

  var terrPolygon = L.Util.extend(L.polygon, {terrObj: undefined});

  var map = L.map('map', {
    crs: CRSPixel,
    attributionControl: false,
    minZoom: -5
  });

  var terrInfo = L.control();

  function getDifficultyColor(difficulty) {
    switch (difficulty) {
      case "Very Low": return "#009933"
      case "Low": return "#33ff77"
      case "Medium": return "#ffff00"
      case "High": return "#ff3300"
      case "Very High": return "#801a00"
    }
  };

  terrInfo.update = function (terrData) {
    this._div.innerHTML = 
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
    `: "";
  };

  var focused = "";

  function setData(e) {
    if (e.target.options.terrObj.name != focused) {focused = ""};
    terrInfo.update(e.target.options.terrObj);
  };

  function resetData(e) {
    if (!focused) {terrInfo.update()};
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

  var bounds = [[-6573,-2383], [-160,1650]];
  var image = L.imageOverlay('main-map.png', bounds).addTo(map);
 
  var terrPolygons = {};

  const urlParams = new URLSearchParams(window.location.search);
  var dataType = urlParams.get("data");

  dataType ? dataType = dataType : dataType = "apiData";

  axios.get(endpoint+dataType)
    .then(response => {
      terrs = response.data;
      // draw terr outlines
      for (i=0;i<terrs.length;i++) {
        let loc = terrs[i].location;
        let outline = new terrPolygon([[loc.startZ, loc.startX],[loc.startZ, loc.endX],[loc.endZ, loc.endX],[loc.endZ, loc.startX]], {color: terrs[i].guildColor, terrObj: terrs[i]});
        outline.on("mouseover", setData);
        outline.on("mouseout", resetData);
        outline.on("click", zoomToFeature);
        outline.addTo(map);
        terrPolygons[terrs[i].name] = outline;

        let gTagOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        gTagOverlay.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        gTagOverlay.setAttribute(`viewBox`, `0 0 ${Math.abs(loc.startX - loc.endX)} ${Math.abs(loc.startZ - loc.endZ)}`);
        gTagOverlay.innerHTML =`<text x="${Math.abs(loc.startX - loc.endX)*(0.04+(0.125*(4-terrs[i].guildTag.length)))}" y="${Math.abs(loc.startZ - loc.endZ)*0.6}" style="font: ${Math.min(Math.abs(loc.startX - loc.endX), Math.abs(loc.startZ - loc.endZ))*0.35}px Poppins; fill: ${terrs[i].guildColor};">${terrs[i].guildTag}</text>`
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
    });
  map.fitBounds(bounds);
});


// console.log(apiData);
        