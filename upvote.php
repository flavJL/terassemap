<?php
header('Content-Type: application/json');
$db = new SQLite3('votes.db');

$characteristic = $_POST['characteristic'];

$db->exec("UPDATE votes SET votes = votes + 1 WHERE characteristic = '$characteristic'");

$result = $db->query("SELECT * FROM votes WHERE characteristic = '$characteristic'");
$row = $result->fetchArray();
echo json_encode($row);
?>
