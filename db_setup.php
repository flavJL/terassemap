<?php
$db = new SQLite3('votes.db');

$query = 'CREATE TABLE IF NOT EXISTS votes (
    characteristic TEXT NOT NULL,
    votes INTEGER DEFAULT 0
)';

$db->exec($query);
?>
