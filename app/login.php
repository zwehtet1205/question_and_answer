<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Read users.json
    $users = json_decode(file_get_contents('../data/users.json'), true);
    foreach ($users as $user) {
        if ($user['username'] === $username && password_verify($password, $user['password'])) {
            $_SESSION['username'] = $username;
            $_SESSION['role'] = $user['role'];
            header('Location: ../dashboard.html');
            exit;
        }
    }
    // Invalid credentials
    header('Location: ../index.html?error=invalid_credentials');
    exit;
}
?>