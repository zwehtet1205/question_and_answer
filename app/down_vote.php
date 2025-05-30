<?php

// inclue helpers 
require_once 'helpers.php';

// start session 
startSession();

// check method is post 
checkRequestMethod('POST');

// check if use is student 
if (getSessionVariable('user_type') !== 'student') {
    sendErrorResponse(401, ['error' => 'Unauthorized']);
}

// get user name from session 
$userName = getSessionVariable('user_name'); 

// get and clean input
$questionId = isset($_POST['question_id']) ? (int)$_POST['question_id'] : 0;

// check if input are valid
if ($questionId <= 0 || !$userName) {
    sendErrorResponse(400, ['error' => 'Invalid request']);
}

// get votes
$votes = readJsonFile('../data/votes.json');

// remove vote for this question by the current user
$filteredVotes = array_values(array_filter($votes, function ($vote) use ($questionId, $userName) {
    return !($vote['question_id'] === $questionId && $vote['user_name'] === $userName);
}));

// save votes 
writeJsonFile('../data/votes.json', $filteredVotes);

// return updated vote count
sendJsonResponse([
    'status' => 'success',
    'message' => 'Vote removed successfully',
    'vote_count' => getVotes($questionId),
    'question_id' => $questionId
]);
