<?php
require_once 'helpers.php';

const JSON_FILE_PATH = '../data/vote.json';

$questionId = isset($_GET['question_id']) ? sanitizeInput($_GET['question_id']) : '';
if ($questionId === '') {
    sendErrorResponse(400, ['error' => 'Invalid question ID']);
}

// Load vote data
$voteData = readJsonFile(JSON_FILE_PATH);

// Filter votes for the given question ID
$filteredVotes = array_filter($voteData, function ($vote) use ($questionId) {
    return $vote['question_id'] === $questionId;
});

// Count votes
$voteCount = count($filteredVotes);

// send JSON response
sendJsonResponse([
    'status' => 'success',
    'question_id' => $questionId,
    'vote_count' => $voteCount,
    'votes' => array_values($filteredVotes)
]);


