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
  placeholder: 'Ajoute un bar' // Custom placeholder text
});

// Add the geocoder to the top-left of the map
map.addControl(geocoder, 'top-left');

// Fetch bar data from the /bars endpoint
fetch('/bars')
  .then(response => response.json())
  .then(data => {
    if (data.message === 'success') {
      const places = data.data;

      // Iterate over each place and create a map marker
      places.forEach(place => {
        fetch(`/bars/${place.id}/tags`)
          .then(response => response.json())
          .then(tagsData => {
            if (tagsData.message === 'success') {
              place.tags = tagsData.data;
            } else {
              console.error('Error fetching tags data:', tagsData.error);
              place.tags = [];
            }

            // Create a map marker
            const titleEl = document.createElement('div');
            titleEl.className = 'title';
            titleEl.textContent = place.name;

            const marker = new mapboxgl.Marker({ element: titleEl })
              .setLngLat([place.longitude, place.latitude])
              .addTo(map);

            // Create a popup
            const popup = createPopup(place);

            // Attach the popup to the marker
            marker.setPopup(popup);
          })
          .catch(error => console.error('Error fetching tags data:', error));
      });
    }
  })
  .catch(error => console.error('Error fetching place data:', error));

function createPopup(place) {
  const popup = new mapboxgl.Popup().setHTML(`
    <div class="popup-container">
      <h3 class="popup-title">${place.name}</h3>
      <p class="popup-description">${place.description}</p>
      <div id="tags-${place.id}" class="tags">
        <h4 class="tags-title">Caractéristiques:</h4>
        <ul id="tag-list-${place.id}" class="tag-list">
          ${place.tags
            .map(
              tag =>
                `<li class="tag-item">
                  ${tag.name} 
                  <span class="tag-votes">(👍 ${tag.upvotes} | 👎 ${tag.downvotes})</span>
                  <div class="tag-buttons">
                    <button class="tag-button" onclick="voteTag(${tag.id}, 1)">Vrai</button>
                    <button class="tag-button" onclick="voteTag(${tag.id}, -1)">Faux</button>
                  </div>
                </li>`
            )
            .join('')}
        </ul>
        <div class="tag-form">
          <input type="text" id="tag-input-${place.id}" placeholder="Ajouter une caractéristique">
          <button class="tag-button" onclick="addTag(${place.id})">Add Tag</button>
        </div>
      </div>
    </div>
  `);

  return popup;
}

function voteTag(tagId, vote) {
  fetch(`/tags/${tagId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ vote: vote })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'success') {
        console.log('Successfully voted on tag:', tagId);
      }
    })
    .catch(error => console.error('Error voting on tag:', error));
}

function addTag(barId) {
  const tagInput = document.getElementById(`tag-input-${barId}`);
  const tag = tagInput.value;
  if (!tag) return;
  fetch(`/bars/${barId}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: tag })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'success') {
        console.log('Successfully added tag:', tag);
        const tagList = document.getElementById(`tag-list-${barId}`);
        const newTag = data.data;
        tagList.innerHTML += `<li>${newTag.name} (Upvotes: ${newTag.upvotes}, Downvotes: ${newTag.downvotes}) <button onclick="voteTag(${newTag.id}, 1)">Upvote</button> <button onclick="voteTag(${newTag.id}, -1)">Downvote</button></li>`;
      }
    })
    .catch(error => console.error('Error adding tag:', error));
  tagInput.value = '';
}

// Attach event listener to the geocoder result selection
geocoder.on('result', function(e) {
  const selectedPlace = e.result;
  const placeName = selectedPlace.text; // Use 'text' instead of 'place_name' to get only the name

  // Populate the form with selected place data
  document.getElementById('place-name').value = placeName;
  document.getElementById('place-lat').style.display = 'none'; // Hide latitude field
  document.getElementById('place-lng').style.display = 'none'; // Hide longitude field

  // Display the second part of the form
  document.getElementById('step-two-form').style.display = 'block';
});

