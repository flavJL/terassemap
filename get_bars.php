<?php
// Connect to the SQLite database
$database = new SQLite3('bars.db');

// Query the database to get the bar data
$results = $database->query('SELECT * FROM bars');

// Fetch the data into an array
$bars = [];
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $bars[] = $row;
}

// Close the database connection
$database->close();

// Send the bar data as JSON
header('Content-Type: application/json');
echo json_encode($bars);
?>
