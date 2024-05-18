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
    `<h1>${terrData.name}</h1>\
    <h2 style="-webkit-text-fill-color: ${terrData.guildColor}">${terrData.guild} [${terrData.guildTag}]</h2>\
    <h2 style="-webkit-text-fill-color: #39ac39">+${terrData.emProd} Emeralds</h2>\
    <h2 style="-webkit-text-fill-color: #39ac39">${terrData.emStorage} Emeralds Stored</h2>\
    ${terrData.oreProd ? `<h2 style="-webkit-text-fill-color: #f2f2f2">+${terrData.oreProd} Ore</h2>` : ""}\
    <h2 style="-webkit-text-fill-color: #f2f2f2">${terrData.oreStorage} Ore Stored</h2>\
    ${terrData.woodProd ? `<h2 style="-webkit-text-fill-color: #ff8c1a">+${terrData.woodProd} Wood</h2>` : ""}\
    <h2 style="-webkit-text-fill-color: #ff8c1a">${terrData.woodStorage} Wood Stored</h2>\
    ${terrData.fishProd ? `<h2 style="-webkit-text-fill-color: #4d79ff">+${terrData.fishProd} Fish</h2>` : ""}\
    <h2 style="-webkit-text-fill-color: #4d79ff">${terrData.fishStorage} Fish Stored</h2>\
    ${terrData.cropProd ? `<h2 style="-webkit-text-fill-color: #ffc34d">+${terrData.cropProd} Crops</h2>` : ""}\
    <h2 style="-webkit-text-fill-color: #ffc34d">${terrData.cropStorage} Crops Stored</h2>\
    <h2>Treasury: <span style="-webkit-text-fill-color: ${getDifficultyColor(terrData.treasury)}">${terrData.treasury}</span></h2>\
    <h2>Defences: <span style="-webkit-text-fill-color: ${getDifficultyColor(terrData.defences)}">${terrData.defences}</span></h2>\
    `;
  };

  terrInfo.reset = function () {
    this._div.innerHTML = "";
  };

  function setData(e) {
    terrInfo.update(e.target.options.terrObj);
  };

  function resetData(e) {
    terrInfo.reset();
  };

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  };

  terrInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'terrInfo');
    return this._div;
  };

  terrInfo.addTo(map);

  var bounds = [[-6573,-2383], [-160,1650]];
  var image = L.imageOverlay('main-map.png', bounds).addTo(map);
 
  

  axios.get('http://localhost:3000/hybridData')
    .then(response => {
      terrs = response.data;
      for (i=0;i<terrs.length;i++) {
        let loc = terrs[i].location;
        let outline = new terrPolygon([[loc.startZ, loc.startX],[loc.startZ, loc.endX],[loc.endZ, loc.endX],[loc.endZ, loc.startX]], {color: terrs[i].guildColor, terrObj: terrs[i]});
        outline.on("mouseover", setData);
        outline.on("mouseout", resetData);
        outline.on("click", zoomToFeature);
        outline.addTo(map);
      }
    });
  map.fitBounds(bounds);
});


// console.log(apiData);
        