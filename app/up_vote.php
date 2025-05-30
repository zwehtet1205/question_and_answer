<?php

// include helpers
require_once 'helpers.php';

// start session 
startSession();

// check if request method is post 
checkRequestMethod('POST');

// check if user is student 
if (getSessionVariable('user_type') !== 'student') {
    sendErrorResponse(401, ['error' => 'Unauthorized']);
}

// get user from session 
$userName = getSessionVariable('user_name'); 

// get question id from input 
$questionId = (int) sanitizeInput($_POST['question_id']);

// check if input is valid 
if ($questionId <= 0 || !$userName) {
    sendErrorResponse(400, ['error' => 'Invalid request']);
}

// get votes
$votes = readJsonFile('../data/votes.json');

// check if user already voted for this question
foreach ($votes as $vote) {
    if ($vote['user_name'] == $userName && $vote['question_id'] == $questionId) {
        sendErrorResponse(409, ['error' => 'You have already voted for this question']);
        exit;
    }
}

// Add to vote.json
$votes[] = [
    'user_name' => $userName,
    'question_id' => (int) $questionId
];
writeJsonFile('../data/votes.json', $votes);

// update vote count
$voteCount = getVotes($questionId);

// return updated vote count
sendJsonResponse([
    'status' => 'success',
    'message' => 'Vote recorded successfully',
    'vote_count' => $voteCount,
    'question_id' => $questionId
]);
