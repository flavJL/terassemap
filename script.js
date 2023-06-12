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
  placeholder: 'Cherche un bar' // Custom placeholder text
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
    <h3>${place.name}</h3>
    <p>${place.description}</p>
    <div id="tags-${place.id}" class="tags">
      <h4>Tags:</h4>
      <ul id="tag-list-${place.id}" class="tag-list">
        ${place.tags
          .map(
            tag =>
              `<li>${tag.name} (Upvotes: ${tag.upvotes}, Downvotes: ${tag.downvotes}) <button onclick="voteTag(${tag.id}, 1)">Upvote</button> <button onclick="voteTag(${tag.id}, -1)">Downvote</button></li>`
          )
          .join('')}
      </ul>
      <div class="tag-form">
        <input type="text" id="tag-input-${place.id}" placeholder="Enter a new tag">
        <button class="tag-button" onclick="addTag(${place.id})">Add Tag</button>
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

function toggleForm() {
  const stepOneForm = document.getElementById('step-one-form');
  const stepTwoForm = document.getElementById('step-two-form');

  if (stepOneForm.style.display === 'none') {
    stepOneForm.style.display = 'block';
    stepTwoForm.style.display = 'none';
  } else {
    stepOneForm.style.display = 'none';
    stepTwoForm.style.display = 'block';

    const placeSearchInput = document.getElementById('place-search');
    const searchQuery = placeSearchInput.value;

    if (searchQuery) {
      geocoder.query(searchQuery, function (result) {
        const placeNameInput = document.getElementById('place-name');
        const placeLatInput = document.getElementById('place-lat');
        const placeLngInput = document.getElementById('place-lng');

        placeNameInput.value = result.result.text;
        placeLatInput.value = result.result.center[1];
        placeLngInput.value = result.result.center[0];
      });
    }
  }
}

function validateSearch() {
  const placeSearchInput = document.getElementById('place-search');
  const searchQuery = placeSearchInput.value;

  if (searchQuery) {
    geocoder.query(searchQuery, function (result) {
      const placeNameInput = document.getElementById('place-name');
      const placeDescriptionInput = document.getElementById('place-description');
      const placeTagsInput = document.getElementById('place-tags');
      const placeLatInput = document.getElementById('place-lat');
      const placeLngInput = document.getElementById('place-lng');
      const stepOneForm = document.getElementById('step-one-form');
      const stepTwoForm = document.getElementById('step-two-form');

      placeNameInput.value = result.result.text;
      placeDescriptionInput.value = '';
      placeTagsInput.value = '';
      placeLatInput.value = result.result.center[1];
      placeLngInput.value = result.result.center[0];
      stepOneForm.style.display = 'none';
      stepTwoForm.style.display = 'block';
    });
  }
}

function submitForm(event) {
  event.preventDefault();

  const placeName = document.getElementById('place-name').value;
  const placeDescription = document.getElementById('place-description').value;
  const placeTags = document.getElementById('place-tags').value;
  const placeLat = document.getElementById('place-lat').value;
  const placeLng = document.getElementById('place-lng').value;

  const formData = {
    name: placeName,
    description: placeDescription,
    tags: placeTags,
    latitude: placeLat,
    longitude: placeLng
  };

  fetch('/bars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'success') {
        console.log('Successfully added bar:', data.data);
        // Clear form inputs
        document.getElementById('place-name').value = '';
        document.getElementById('place-description').value = '';
        document.getElementById('place-tags').value = '';
        document.getElementById('place-lat').value = '';
        document.getElementById('place-lng').value = '';
        // Toggle form visibility
        toggleForm();
      } else {
        console.error('Error adding bar:', data.error);
      }
    })
    .catch(error => console.error('Error adding bar:', error));
}

// Attach event listener to the form submit button
document.getElementById('step-two-form').addEventListener('submit', submitForm);
