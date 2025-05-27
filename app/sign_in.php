<?php

require_once 'helpers.php';

startSession();

checkRequestMethod('POST');

// Sanitize input using helper
$username = sanitizeInput($_POST['user_name'] ?? '');
$password = sanitizeInput($_POST['hashed_password'] ?? '');

// Load user database safely
$users = readJsonFile('../data/users_db.json');

$isAuthenticated = false;

foreach ($users as $user) {
    if (
        $user['user_name'] === $username &&
        password_verify($password, $user['hashed_password'])
    ) {
        // Set session via helper
        setSessionVariable('user_name', $user['user_name']);
        setSessionVariable('user_type', $user['user_type']);

        $isAuthenticated = true;

        // Redirect to dashboard
        sendJsonResponse([
            'status' => 'success',
            'message' => 'Login successful',
            'redirect_url' => getBaseUrl().'dashboard.html'
        ]);

        
    }
}

// Invalid credentials
if (!$isAuthenticated) {
    setMessage('error', 'Invalid username or password.');
    sendJsonResponse([
        'status' => 'error',
        'message' => 'Invalid username or password.'
    ]);
}
