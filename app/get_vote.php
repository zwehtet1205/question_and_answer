<?php

// include helpers 
require_once 'helpers.php';

// get and clean input 
$questionId = isset($_GET['question_id']) ? sanitizeInput($_GET['question_id']) : '';

// check if input is valid
if ($questionId === '') {
    sendErrorResponse(400, ['error' => 'Invalid question ID']);
}

// count votes
$voteCount = getVotes($questionId);

// send JSON response
sendJsonResponse([
    'status' => 'success',
    'question_id' => $questionId,
    'vote_count' => $voteCount,
]);



