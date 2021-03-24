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

var timeSteps = ['Summer2013','Winter2013','Summer2014','Winter2014','Summer2015','Winter2015','Summer2016','Winter2016','Summer2017','Winter2017','Summer2018']
var currentYear = 'Summer2013'
var key = 'bc'

// load all layers onto map first
map.on('style.load',function() {
  // add black carbon data
  map.addSource('black-carbon', {
      type: 'geojson',
      data: 'data/black-carbon.geojson'
  });

  // iterate through data available for all timestamps
  for (i = 0; i < timeSteps.length; i++) {
    map.addLayer({
      'id':timeSteps[i].concat('bc'),
      'type': 'fill',
      'source': 'black-carbon',
      'layout': {'visibility': 'none'},
      'paint': {
        'fill-color':
          ['interpolate',
          ['linear'],
          ['get', timeSteps[i]],
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
        'fill-opacity': 0.6
      }
    })
  }

  // set one layer visible to load initial map
  map.setLayoutProperty(currentYear.concat('bc'), 'visibility', 'visible')

  // add nitric oxide data
  map.addSource('nitric-oxide', {
      type: 'geojson',
      data: 'data/nitric-oxide.geojson'
  });

  // iterate through data available for all timestamps
  for (i = 0; i < timeSteps.length; i++) {
    map.addLayer({
      'id':timeSteps[i].concat('no'),
      'type': 'fill',
      'source': 'nitric-oxide',
      'layout': {'visibility': 'none'},
      'paint': {
        'fill-color':
          ['interpolate',
          ['linear'],
          ['get', timeSteps[i]],
          7,'#ffefdc',
          14,'#f5c5ab',
          21,'#f1b093',
          28,'#e78662',
          35,'#e27149',
          42,'#d15e3d',
          49,'#b13925',
          56,'#a02619',
          63,'#7f0101',
          70,'#660202'
          ],
        'fill-outline-color': '#ccc',
        'fill-opacity': 0.6
      }
    })
  }

  // add particulate matter data
  map.addSource('particulate-matter', {
      type: 'geojson',
      data: 'data/particulate-matter.geojson'
  });

  // iterate through data available for all timestamps
  for (i = 0; i < timeSteps.length; i++) {
    map.addLayer({
      'id':timeSteps[i].concat('pm'),
      'type': 'fill',
      'source': 'particulate-matter',
      'layout': {'visibility': 'none'},
      'paint': {
        'fill-color':
          ['interpolate',
          ['linear'],
          ['get', timeSteps[i]],
          6.0,'#ffefdc',
          7.0,'#f5c5ab',
          8.0,'#f1b093',
          9.0,'#e78662',
          10.0,'#e27149',
          11.0,'#d15e3d',
          12.0,'#b13925',
          13.0,'#a02619',
          14.0,'#7f0101',
          15.0,'#660202'
          ],
        'fill-outline-color': '#ccc',
        'fill-opacity': 0.6
      }
    })
  }

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

  // add hover function
  map.on('mousemove', function (e) {

    var features = map.queryRenderedFeatures(e.point, {
        layers: [currentYear.concat(key)],
    });

    if (features.length > 0) {

      var hoveredFeature = features[0];
      var name = hoveredFeature.properties.CDname;
      var mean = hoveredFeature.properties[currentYear];

      var popupContent = `
        <div>
          <b>${name}</b><br/>
          Average pollutant measure: ${mean}<br/>
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
  map.setLayoutProperty(currentYear.concat(key), 'visibility', 'none')
  map.setLayoutProperty(dataTimestamp.concat(key), 'visibility', 'visible')
  currentYear = dataTimestamp

  console.log(dataTimestamp.concat(key)+'B')
  console.log(currentYear.concat(key)+'C')

  return currentYear;
}

// add a noUiSlider
var slider = document.getElementById('slider');

// get date from string, to be used in slider and data conversion
function timestamp(str) {
  return new Date(str).getTime();
}

noUiSlider.create(slider, {
    start: [timestamp('2013-05-01')],
    range: {
        'min': timestamp('2013-05-01'),
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
    dateValue.innerHTML = sliderTimestamp // returns slider value into html siderbar
    console.log(dataTimestamp+'A')
    if (currentYear != dataTimestamp) { // added an if-statement so that the initial state does not immediately trigger updateElements() and prevent style to stop loading
        updateElements()
    }
  }
})

// listens to bootstrap button for nitric oxide
$('#no-button').on('click', function(event) {
  console.log('no button clicked');
  $(this).addClass('active');
  $('#bc-button').removeClass('active');
  $('#pm-button').removeClass('active');
  event.preventDefault();
  event.stopPropagation();
  map.setLayoutProperty(currentYear.concat(key), 'visibility', 'none')

  var legendContent = `
    <div class='legend-title'>Nitric Oxide (NO) gases react to form smog and acid rain as well as being central to the formation of fine particles and ground level ozone, both of which are associated with adverse health effects.
    <br/><br/>Atmospheric parts per billion (ppb) <i class="fas fa-info-circle" data-toggle="tooltip" title='Standard unit for concentration by volume'></i></div>
    <div class='legend-scale'>
      <ul class='legend-labels'>
        <li><span style='background:#ffefdc;'></span>7.0</li>
        <li><span style='background:#f1b093;'></span>21.0</li>
        <li><span style='background:#e27149;'></span>35.0</li>
        <li><span style='background:#b13925;'></span>49.0</li>
        <li><span style='background:#7f0101;'></span>63.0</li>
      </ul>
    </div>
  `

  document.getElementById('legend').innerHTML = legendContent
  // initialize tooltips again
  $('[data-toggle="tooltip"]').tooltip({placement:'right'});

  key = 'no'; // changes concatenated value for timestamp to select correct nitric oxide layer
  updateElements();
  return key;
})

// listens to bootstrap button for black carbon
$('#bc-button').on('click', function(event) {
  console.log('bc button clicked');
  $(this).addClass('active');
  $('#no-button').removeClass('active');
  $('#pm-button').removeClass('active');
  event.preventDefault();
  event.stopPropagation();
  map.setLayoutProperty(currentYear.concat(key), 'visibility', 'none')

  var legendContent = `
  <div class='legend-title'>Black carbon is the sooty black material emitted from gas and diesel engines, coal-fired power plants, and other sources that burn fossil fuel.
  <br/><br/>Absorbance units <i class="fas fa-info-circle" data-toggle="tooltip" title='Measurement of black carbon concentration'></i></div>
  <div class='legend-scale'>
    <ul class='legend-labels'>
      <li><span style='background:#ffefdc;'></span>0.2</li>
      <li><span style='background:#f1b093;'></span>0.6</li>
      <li><span style='background:#e27149;'></span>1.0</li>
      <li><span style='background:#b13925;'></span>1.4</li>
      <li><span style='background:#7f0101;'></span>1.8</li>
    </ul>
  </div>
  `

  document.getElementById('legend').innerHTML = legendContent
  // initialize tooltips again
  $('[data-toggle="tooltip"]').tooltip({placement:'right'});

  key = 'bc'; // changes concatenated value for timestamp to select correct black carbon layer
  updateElements();
  return key;
})

// listens to bootstrap button for particulate matter
$('#pm-button').on('click', function(event) {
  console.log('pm button clicked');
  $(this).addClass('active');
  $('#no-button').removeClass('active');
  $('#bc-button').removeClass('active');
  event.preventDefault();
  event.stopPropagation();
  map.setLayoutProperty(currentYear.concat(key), 'visibility', 'none')

  var legendContent = `
  <div class='legend-title'>Particulate Matter (PM2.5) refers to particles that have diameter less than 2.5 micrometres. These particles are formed as a result of burning fuel and chemical reactions that take place in the atmosphere.
  <br/><br/>Micrograms per cubic meter of air <i class="fas fa-info-circle" data-toggle="tooltip" title='Standard unit for concentration by weight'></i></div>
  <div class='legend-scale'>
    <ul class='legend-labels'>
      <li><span style='background:#ffefdc;'></span>6.0</li>
      <li><span style='background:#f1b093;'></span>8.0</li>
      <li><span style='background:#e27149;'></span>10.0</li>
      <li><span style='background:#b13925;'></span>12.0</li>
      <li><span style='background:#7f0101;'></span>14.0</li>
    </ul>
  </div>
  `

  document.getElementById('legend').innerHTML = legendContent
  // initialize tooltips again
  $('[data-toggle="tooltip"]').tooltip({placement:'right'});

  key = 'pm'; // changes concatenated value for timestamp to select correct particulate matter layer
  updateElements();
  return key;
})

// initialize tooltips
$('[data-toggle="tooltip"]').tooltip({placement:'right'});
