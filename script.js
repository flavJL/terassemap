// Function to add a bar
function addBar(event) {
    event.preventDefault();

    // Get the coordinates input value
    const coordinatesInput = document.getElementById('coordinates');
    const coordinates = coordinatesInput.value;

    // Clear the input field
    coordinatesInput.value = '';

    // Send the coordinates to the server
    fetch('add_bar.php', {
        method: 'POST',
        body: new URLSearchParams({
            coordinates: coordinates
        })
    })
    .then(() => {
        // Refresh the page to update the map with the new bar
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to initialize the map and fetch bar data
function initializeMap() {
    // Initialize the map
    const map = L.map('map').setView([43.2965, 5.3698], 13);

    // Add the tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Fetch bar data from the server
    fetch('get_bars.php')
        .then(response => response.json())
        .then(data => {
            // Process the bar data and add markers to the map
            data.forEach(bar => {
                const marker = L.marker([bar.latitude, bar.longitude]).addTo(map);
                marker.bindPopup(bar.name);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Initialize the map
initializeMap();
