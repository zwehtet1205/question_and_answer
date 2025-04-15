<?php
session_start();
if (isset($_SESSION['role'])) {
    header('Content-Type: application/json');
    echo json_encode(['role' => $_SESSION['role']]);
} else {
    http_response_code(401);
    exit;
}
?>