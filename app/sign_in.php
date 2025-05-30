<?php

// include helpers
require_once 'helpers.php';

// start session 
startSession();

// check method is post 
checkRequestMethod('POST');

// get and clean input
$username = sanitizeInput($_POST['user_name'] ?? '');
$password = sanitizeInput($_POST['hashed_password'] ?? '');

// get users 
$users = readJsonFile('../data/users_db.json');


$isAuthenticated = false;

foreach ($users as $user) {

    // check if username and password is correct 
    if ($user['user_name'] === $username &&password_verify($password, $user['hashed_password'])) {
        
        // set session variable 
        setSessionVariable('user_name', $user['user_name']);
        setSessionVariable('user_type', $user['user_type']);

        // regenerate session id 
        session_regenerate_id();

        $isAuthenticated = true;

        // send json response 
        sendJsonResponse([
            'status' => 'success',
            'message' => 'Login successful',
            'redirect_url' => getBaseUrl().'dashboard.html'
        ]);

    }
}

// invalid credentials 
if (!$isAuthenticated) {
    sendJsonResponse([
        'status' => 'error',
        'message' => 'Invalid username or password.'
    ]);
}
