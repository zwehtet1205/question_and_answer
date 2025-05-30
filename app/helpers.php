<?php

// send success response 
function sendJsonResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

// send error response 
function sendErrorResponse($statusCode, $errorData) {
    http_response_code($statusCode);
    sendJsonResponse($errorData);
}

// sanitize input 
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// check if json is valid 
function isValidJson($json) {
    json_decode($json);
    return (json_last_error() === JSON_ERROR_NONE);
}

// read json file 
function readJsonFile($filePath) {

    // check if file exists 
    if (!is_file($filePath)) {
        sendErrorResponse(404, ['error' => 'File not found']);
    }

    // read file
    $jsonContent = @file_get_contents($filePath);

    // check if valid json content 
    if ($jsonContent === false) {
        sendErrorResponse(500, ['error' => 'Failed to read file']);
    }

    // check if valid json 
    if (!isValidJson($jsonContent)) {
        sendErrorResponse(500, ['error' => 'Invalid JSON format']);
    }

    // return decoded json 
    return json_decode($jsonContent, true);
}

// write json file 
function writeJsonFile($filePath, $data) {

    // encode json data 
    $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    // check if json data is valid 
    if ($jsonContent === false) {
        sendErrorResponse(500, ['error' => 'Failed to encode data to JSON']);
    }

    // check if file patch is able to write 
    if (file_put_contents($filePath, $jsonContent) === false) {
        sendErrorResponse(500, ['error' => 'Failed to write to file']);
    }
}

// get base url 
function getBaseUrl() {
    // get protocol
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";

    // get host
    $host = $_SERVER['HTTP_HOST'];

    // get dir 
    $scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME']));

    // return base url 
    return rtrim($protocol . $host . $scriptDir, '/') . '/';
}


// check request method 
function checkRequestMethod($method) {
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
        sendErrorResponse(405, ['error' => 'Method Not Allowed']);
    }
}

// start session 
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}



// check if user is authenticated 
function isAuthenticated() {
    return isset($_SESSION['user_name']) && isset($_SESSION['user_type']);
}

// destroy session
function destroySession() {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_unset();
        session_destroy();
    }
}

// set session variable 
function setSessionVariable($key, $value) {
    $_SESSION[$key] = $value;
}

// get session variable 
function getSessionVariable($key) {
    return isset($_SESSION[$key]) ? $_SESSION[$key] : null;
}

// check session variable 
function checkSessionVariable($key) {
    return isset($_SESSION[$key]);
}

// clear session variable 
function clearSessionVariable($key) {
    if (isset($_SESSION[$key])) {
        unset($_SESSION[$key]);
    }
}

// get votes 
function getVotes($questionId) {

    // get votes 
    $voteData = readJsonFile('../data/votes.json');

    // filter votes
    $filteredVotes = array_filter($voteData, function ($vote) use ($questionId) {
        return $vote['question_id'] === (int) $questionId;
    });

    // count vote 
    $voteCount = count($filteredVotes);
    
    return $voteCount;
}

