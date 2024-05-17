document.addEventListener('DOMContentLoaded', function () {
  var CRSPixel = L.Util.extend(L.CRS.Simple, {
    transformation: new L.Transformation(1,0,1,0)
  });

  var map = L.map('map', {
    crs: CRSPixel,
    minZoom: -5
  });

  var bounds = [[-6573,-2383], [-160,1650]];
  var image = L.imageOverlay('main-map.png', bounds).addTo(map);
 
  map.fitBounds(bounds);

  axios.get('https://athena.wynntils.com/cache/get/territoryList')
    .then(response => {
      terrs = Object.entries(response.data.territories);
      console.log(terrs);
      for (i=0;i<terrs.length;i++) {
        let loc = terrs[i][1].location;
        let outline = L.polygon([[loc.startZ, loc.startX],[loc.startZ, loc.endX],[loc.endZ, loc.endX],[loc.endZ, loc.startX]], {color: terrs[i][1].guildColor}).addTo(map);
      }
    });

});


// console.log(apiData);
        