console.log("logic.js loaded");

// GeoJSON url variable
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create earthquake layerGroup
var earthquakes = L.layerGroup();

// Add tile layer to the map
var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

// Create map object
var myMap = L.map("mapid", {
  center: [38.92, -97],
  zoom: 5,
  layers: [grayscaleMap, earthquakes]
});


d3.json(earthquakesURL).then(earthquakeData =>{
  console.log(earthquakeData);
  // Markers size by magnitude
  function markerSize(magnitude) {
    return magnitude * 4;
  };
  // Markers color depth
  function chooseColor(depth) {
    switch (true) {
      case depth > 90:
        return "red";
      case depth > 70:
        return "orangered";
      case depth > 50:
        return "orange";
      case depth > 30:
        return "gold";
      case depth > 10:
        return "yellow";
      default:
        return "lightgreen";
    }
  }

  // GeoJSON layer 
  // Popup creation for place and time of the earthquake
  L.geoJSON(earthquakeData.features, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng,
        // Style of the markers based on properties.mag
        {
          radius: markerSize(feature.properties.mag),
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          stroke: true,
          weight: 0.5
        }
      );
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
        + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  }).addTo(earthquakes);
  // Create Map function
  earthquakes.addTo(myMap);

  // Legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend"),
      depth = [-10, 10, 30, 50, 70, 90];

    // div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
        depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
} );