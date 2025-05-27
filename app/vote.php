<?php

require_once 'helpers.php';

startSession();
checkRequestMethod('POST');

if (getSessionVariable('role') !== 'student') {
    redirectTo('../index.html');
}

$userId = getSessionVariable('user_id'); 
$questionId = isset($_POST['question_id']) ? (int)$_POST['question_id'] : 0;

if ($questionId <= 0 || !$userId) {
    sendErrorResponse(400, ['error' => 'Invalid request']);
}

// Load votes
$votes = readJsonFile('../data/vote.json');

// Check if this user already voted for this question
foreach ($votes as $vote) {
    if ($vote['user_id'] == $userId && $vote['question_id'] == $questionId) {
        sendErrorResponse(400, ['error' => 'You have already voted for this question']);
        exit;
    }
}

// Add to vote.json
$votes[] = [
    'user_id' => $userId,
    'question_id' => $questionId
];
writeJsonFile('../data/vote.json', $votes);

// Return updated vote count
sendJsonResponse([
    'status' => 'success',
    'message' => 'Vote recorded successfully',
    'question_id' => $questionId
]);
