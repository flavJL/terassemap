// The Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZmxhdmlzYnVpbGRpbmciLCJhIjoiY2xpbjVycGY1MDI4czNxbWxwbDMydXB5biJ9.LxYdRjcoKE0N4sHkgJuSeA';

// The WeatherAPI key
const weatherApiKey = '699093b9e65e4ec08b6172342230906';

// Declare the map variable outside the initializeMap function
let map;

// Function to initialize the map and geocoder
function initializeMap() {
    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [5.3698, 43.2965],
        zoom: 13
    });

    // Initialize the Mapbox geocoder
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
    });

    // Add the geocoder to the top left of the map
    map.addControl(geocoder, 'top-left');


    // Handle the 'result' event of the geocoder
    geocoder.on('result', function(e) {
        const coordinates = e.result.geometry.coordinates;

        // Get sun times and position
        const times = SunCalc.getTimes(new Date(), coordinates[1], coordinates[0]);
        const sunsetPosition = SunCalc.getPosition(times.sunset, coordinates[1], coordinates[0]);

        // Start building the description
        let description = `<p>Levé du soleil: ${times.sunrise.toLocaleTimeString('fr-FR')}<br>Couché du soleil: ${times.sunset.toLocaleTimeString('fr-FR')}<br>Solar noon: ${times.solarNoon.toLocaleTimeString('fr-FR')}</p>`;

        // Calculate the time of year weight
        const timeOfYearWeight = 0.5 + 0.5 * Math.cos(sunsetPosition.azimuth);

        // Fetch water proximity data from Mapbox
        fetch(`https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${coordinates[0]},${coordinates[1]}.json?radius=1000&layers=water&access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
                // Calculate the water proximity weight
                const waterProximityWeight = data.features.length > 0 ? 1 : 0.5;

                // Calculate the visibility chance
                const visibilityChance = timeOfYearWeight * waterProximityWeight * 100;

                // Add the visibility chance to the description
                description += `<p>Probabilité d'y voir le couché du soleil: ${visibilityChance.toFixed(2)}%</p>`;

                // Fetch weather data from WeatherAPI
                fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${coordinates[1]},${coordinates[0]}`)
                    .then(response => response.json())
                    .then(weatherData => {
                        // Add the weather data to the description
                        description += `<p>Météo: ${weatherData.current.condition.text}<br>Temperature: ${weatherData.current.temp_c}°C<br>Vent: ${weatherData.current.wind_kph} km/h</p>`;
                        
                        // Create a popup with the description and add it to the map
                        new mapboxgl.Popup({ className: 'my-custom-popup' })
                            .setLngLat(coordinates)
                            .setHTML(description)
                            .addTo(map);
                    });
            });
    });
}

initializeMap();

// Function to fetch the votes for the current characteristics from the server
function fetchVotes() {
    fetch('fetch_votes.php')
        .then(response => response.json())
        .then(votes => {
            // Process votes and update the badges with vote counts
            const badges = document.querySelectorAll('.characteristic-badge');
            badges.forEach(badge => {
                const characteristic = badge.getAttribute('data-characteristic');
                const vote = votes.find(vote => vote.characteristic === characteristic);
                const voteCount = vote ? vote.votes : 0;
                badge.textContent = `${characteristic}: ${voteCount} votes`;
            });
        });
}

// Function to handle upvoting a characteristic
function handleUpvote(characteristic) {
    fetch('upvote.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'characteristic': characteristic,
        }),
    })
    .then(response => response.json())
    .then(updatedVote => {
        // Update the badge with the new vote count
        const badge = document.querySelector(`[data-characteristic="${characteristic}"]`);
        if (badge) {
            badge.textContent = `${characteristic}: ${updatedVote.votes} votes`;
        }
    });
}

// Fetch the votes when the page loads
fetchVotes();

// Event listeners for characteristics badges
const badges = document.querySelectorAll('.characteristic-badge');
badges.forEach(badge => {
    const characteristic = badge.getAttribute('data-characteristic');
    badge.addEventListener('click', () => handleUpvote(characteristic));
});
