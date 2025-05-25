<?php 

session_start();

$data;

// Check if the user is logged in
if (isset($_SESSION['username']) && isset($_SESSION['role'])) {
    $data['logged_in'] = true;
} else {
    $data['logged_in'] = false;
}

header('Content-Type: application/json');
echo json_encode($data);
exit;

