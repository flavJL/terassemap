//Frontend.js

// Fetches bars from the backend and adds them to the map
function fetchBars(map) {
    fetch('DatabaseHandler.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'action=getBars'
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
  
  // Creates popup content for a bar
  function createPopupContent(name, description, category) {
    const content = `
      <h3>${name}</h3>
      <p>Description: ${description}</p>
      <p>Category: ${category}</p>
    `;
  
    return content;
  }
  