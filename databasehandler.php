<?php
  // Include the Database class
  include_once 'DatabaseClass.php';
  $db = new Database();

  // Get the action from the AJAX request
  $action = $_POST['action'];

  // Handle the action
  if ($action == 'getBars') {
    $bars = $db->getBars();
    $data = [];

    while ($row = $bars->fetch(PDO::FETCH_ASSOC)) {
      $data[] = $row;
    }

    echo json_encode($data);
  }
?>
