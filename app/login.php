<?php

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Sanitize input data
    $name = filter_input(INPUT_POST, 'user_name', FILTER_SANITIZE_STRING);
    $password = filter_input(INPUT_POST, 'hashed_password', FILTER_SANITIZE_STRING);

    // Read users.json
    $user_data = json_decode(file_get_contents('../data/users_db.json'), true);

    $is_authenticated = false;

    foreach ($user_data as $record) {
        if ($record['user_name'] === $name && password_verify($password, $record['hashed_password'])) {
            // set session variables
            $_SESSION['user_name'] = $username;
            $_SESSION['user_type'] = $user['user_type'];

            $is_authenticated = true;

            // Redirect to dashboard
            header('Location: ../dashboard.html');
            exit();
        }
    }
    // Invalid credentials
    if (!$is_authenticated) {
        $_SESSION['error'] = 'Invalid username or password.';
        header('Location: ../login.html');
        exit();
    }
}
?>