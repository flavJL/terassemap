<?php
header('Content-Type: application/json');
$db = new SQLite3('votes.db');

$results = $db->query('SELECT * FROM votes');
$votes = [];
while ($row = $results->fetchArray()) {
    $votes[] = $row;
}
echo json_encode($votes);
?>
