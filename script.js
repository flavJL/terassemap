// Script.js

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZmxhdmlzYnVpbGRpbmciLCJhIjoiY2xpbjVycGY1MDI4czNxbWxwbDMydXB5biJ9.LxYdRjcoKE0N4sHkgJuSeA';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [5.3698, 43.2965],
  zoom: 13
});

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: 'Search for a location', // Custom placeholder text
  });
  
  // Add the geocoder to the top-left of the map
  map.addControl(geocoder, 'top-left');

// Function to fetch bars from the backend and add them to the map
function fetchBars(map) {
    fetch('DatabaseHandler.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=addBar&name=${name}&description=${description}&category=${category}&lat=${lat}&lng=${lng}`
      })

  .then(response => response.json())
  .then(bars => {
    bars.forEach(bar => {
      const coordinates = [bar.lng, bar.lat];
      const popup = new mapboxgl.Popup({
        closeButton: false,
        offset: 25,
        className: 'custom-popup-map'
      })
      .setHTML(createPopupContent(bar.name, bar.description, bar.category))
      .addTo(map);

      new mapboxgl.Marker()
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map);
    });
  });
}

// Function to create popup content for a bar
function createPopupContent(name, description, category) {
  const content = `
    <h3>${name}</h3>
    <p>Description: ${description}</p>
    <p>Category: ${category}</p>
  `;

  return content;
}

// Event listener to show the add bar form when "Ajoute un lieu" button is clicked
document.getElementById('ajoute-un-bar').addEventListener('click', function() {
  document.getElementById('add-bar-form').style.display = 'block';
});

// Event listener to handle form submission
document.getElementById('add-bar-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.elements['bar-name'].value;
  const description = form.elements['bar-description'].value;
  const category = form.elements['bar-category'].value;
  const lat = form.elements['bar-lat'].value;
  const lng = form.elements['bar-lng'].value;

  addBar(name, description, category, lat, lng);
});

// Function to add a new bar to the database
function addBar(name, description, category, lat, lng) {
  const params = new URLSearchParams();
  params.append('action', 'addBar');
  params.append('name', name);
  params.append('description', description);
  params.append('category', category);
  params.append('lat', lat);
  params.append('lng', lng);

  fetch('DatabaseHandler.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
    .then(response => response.text())
    .then(response => {
      console.log(response); // Log the response from the server
      document.getElementById('add-bar-form').style.display = 'none'; // Hide the form after submission
    })
    .catch(error => console.log(error));
}

// Call the function to fetch bars from the backend and add them to the map
fetchBars(map);
