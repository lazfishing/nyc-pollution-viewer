mapboxgl.accessToken = 'pk.eyJ1IjoibGF6ZmlzaGluZyIsImEiOiJja2wzY2xoODgxaWoyMnJwbHdraXkzdjRhIn0.0dz4Ra_uLwB7SM1LAIDebw';

var options = {
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-73.95, 40.7],
  zoom: 10
}

var map = new mapboxgl.Map(options);
map.scrollZoom.disable();

// add the geocoder with set parameters bounding NYC
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: map,
    placeholder:'Search in New York City',
    bbox: [-74.376068,40.427088,-73.442230,41.074175],
  })
);

// add a navigation control
var nav = new mapboxgl.NavigationControl()
map.addControl(nav,'top-left')

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

// load map the first time
map.on('style.load',function() {
  map.addSource('black-carbon', {
      type: 'geojson',
      data: 'data/black-carbon.geojson'
  });

  map.addLayer({
    'id':'blackCarbonMean',
    'type': 'fill',
    'source': 'black-carbon',
    'layout': {'visibility': 'visible'},
    'paint': {
      'fill-color':
        ['interpolate',
        ['linear'],
        ['get', dataTimestamp],
        0.2,'#ffefdc',
        0.4,'#f5c5ab',
        0.6,'#f1b093',
        0.8,'#e78662',
        1.0,'#e27149',
        1.2,'#d15e3d',
        1.4,'#b13925',
        1.6,'#a02619',
        1.8,'#7f0101',
        2.0,'#660202'
        ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.7
    }
  })

  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.addLayer({
    id: 'highlight-line',
    type: 'fill',
    source: 'highlight-feature',
    paint: {
      'fill-color': '#ccc',
      'fill-opacity': 0.7,
      'fill-outline-color': 'white'
    }
  });

  map.on('mousemove', function (e) {

    var features = map.queryRenderedFeatures(e.point, {
        layers: ['blackCarbonMean'],
    });

    if (features.length > 0) {

      var hoveredFeature = features[0];
      var name = hoveredFeature.properties.CDname;
      var mean = hoveredFeature.properties.Summer2012;

      var popupContent = `
        <div>
          <b>${name}</b><br/>
          Mean Absorbance Unit: ${mean}<br/>
        </div>
      `

      popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
      map.getSource('highlight-feature').setData(hoveredFeature.geometry);
      map.getCanvas().style.cursor = 'pointer';
    } else {
      popup.remove();
      map.getCanvas().style.cursor = '';
      map.getSource('highlight-feature').setData({
            "type": "FeatureCollection",
            "features": []
        });
    }

  })
})

// function to update the map once the slider value changes
function updateElements(){

  if (map.getLayer('blackCarbonMean')) {
    map.removeLayer('blackCarbonMean');
  }
  if (map.getSource('black-carbon')) {
    map.removeSource('black-carbon');
  }
  if (map.getLayer('highlight-line')) {
    map.removeLayer('highlight-line');
  }
  if (map.getSource('highlight-feature')) {
    map.removeSource('highlight-feature');
  }

  map.addSource('black-carbon', {
      type: 'geojson',
      data: 'data/black-carbon.geojson'
  });

  map.addLayer({
    'id':'blackCarbonMean',
    'type': 'fill',
    'source': 'black-carbon',
    'layout': {'visibility': 'visible'},
    'paint': {
      'fill-color':
        ['interpolate',
        ['linear'],
        ['get', dataTimestamp],
        0.2,'#ffefdc',
        0.4,'#f5c5ab',
        0.6,'#f1b093',
        0.8,'#e78662',
        1.0,'#e27149',
        1.2,'#d15e3d',
        1.4,'#b13925',
        1.6,'#a02619',
        1.8,'#7f0101',
        2.0,'#660202'
      ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.7
    }
  })

  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.addLayer({
    id: 'highlight-line',
    type: 'fill',
    source: 'highlight-feature',
    paint: {
      'fill-color': '#ccc',
      'fill-opacity': 0.7,
      'fill-outline-color': 'white'
    }
  });

  map.on('mousemove', function (e) {

    var features = map.queryRenderedFeatures(e.point, {
        layers: ['blackCarbonMean'],
    });

    if (features.length > 0) {

      var hoveredFeature = features[0];
      var name = hoveredFeature.properties.CDname;
      var mean = hoveredFeature.properties[dataTimestamp];

      var popupContent = `
        <div>
          <b>${name}</b><br/>
          Mean Absorbance Unit: ${mean}<br/>
        </div>
      `

      popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
      map.getSource('highlight-feature').setData(hoveredFeature.geometry);
      map.getCanvas().style.cursor = 'pointer';
    } else {
      popup.remove();
      map.getCanvas().style.cursor = '';
      map.getSource('highlight-feature').setData({
            "type": "FeatureCollection",
            "features": []
        });
    }

  })

  console.log(dataTimestamp+'B')
}

// add a noUiSlider
var slider = document.getElementById('slider');

// get date from string, to be used in slider and data conversion
function timestamp(str) {
  return new Date(str).getTime();
}

noUiSlider.create(slider, {
    start: [timestamp('2012-05-01')],
    range: {
        'min': timestamp('2012-05-01'),
        'max': timestamp('2018-05-01')
    },
    step: 182.5*24*60*60*1000
});

// function to take in slider month value and output either summer or winter
function summer(d) {
  if (d > 6) {
    return 'Winter';
  } else {
    return 'Summer';
  }
}

// function to return a date string, e.g. 'Summer 2018'
function formatDateNicely(date) {
    return summer(date.getMonth()) + " " + date.getFullYear();
}

// function to return a date string to reference data file, e.g. '2018-05-01'
function formatDateBadly(date) {
    return summer(date.getMonth()) + date.getFullYear();
}

dateValue = document.getElementById('sliderValue')

// listens to updates in real time and returns the slider value
slider.noUiSlider.on('update',function (values, handle) {
  if (handle === 0) {
    sliderTimestamp = formatDateNicely(new Date(+values[handle]))
    dataTimestamp = formatDateBadly(new Date(+values[handle]))
    dateValue.innerHTML = sliderTimestamp
    // returns slider value into html siderbar
    console.log(dataTimestamp+'A')
    updateElements()
  }
})
