<?php
// Connect to the SQLite database
$database = new SQLite3('bars.db');

// Get the form data
$coordinates = $_POST['coordinates'];

// Extract latitude and longitude from the coordinates string
$coordinatesArray = explode(',', $coordinates);
$latitude = trim($coordinatesArray[0]);
$longitude = trim($coordinatesArray[1]);

// Insert the bar data into the database
$statement = $database->prepare('INSERT INTO bars (latitude, longitude) VALUES (:latitude, :longitude)');
$statement->bindValue(':latitude', $
