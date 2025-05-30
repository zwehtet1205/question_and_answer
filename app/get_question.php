<?php

// include helpers
require_once "helpers.php";

// check the request method is GET
checkRequestMethod('GET');

// get and validate input
$id = sanitizeInput($_GET['id'] ?? '');

// check if id is empty or not a number
if (empty($id) || !is_numeric($id)) {
    sendErrorResponse(400, ['error' => 'Missing or invalid question ID']);
}


// get data from JSON files
$questions = readJsonFile('../data/questions.json');
$answers = readJsonFile('../data/answers.json');

$id = (int) $id;

// get the question by ID
$question = array_values(array_filter($questions, fn($q) => $q['id'] === $id))[0];

// get votes
$question['votes'] = (string) getVotes($id);

// return 404 if the question is not found
if (empty($question)) {
    sendErrorResponse(404, ['error' => 'Question not found']);
}

// get answers related to the question
$relatedAnswers = array_values(array_filter($answers, function($a) use ($id) {
    return $a['question_id'] === $id;
}));


// Send json response
sendJsonResponse([
    'question' => $question,
    'answers' => $relatedAnswers
]);
