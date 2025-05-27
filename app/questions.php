<?php

require_once 'helpers.php';

startSession();

// Sanitize input
$module = isset($_GET['module']) ? sanitizeInput($_GET['module']) : '';
$status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : '';

// Load data 
$questions = readJsonFile('../data/questions.json');
$answers = readJsonFile('../data/answers.json');

// Get answered question IDs
$answeredIds = array_column($answers, 'question_id');

// Filter questions
$filtered = array_filter($questions, function ($q) use ($module, $status, $answeredIds) {
    $matchModule = $module ? $q['module'] === $module : true;

    $matchStatus = true;
    if ($status === 'answered') {
        $matchStatus = in_array($q['id'], $answeredIds);
    } elseif ($status === 'unanswered') {
        $matchStatus = !in_array($q['id'], $answeredIds);
    }

    return $matchModule && $matchStatus;
});

// Sort questions by timestamp
usort($filtered, function ($a, $b) {
    return $b['timestamp'] <=> $a['timestamp'];
});

// Get answers
$results = [];
foreach ($filtered as $q) {
    $relatedAnswers = array_filter($answers, function ($a) use ($q) {
        return $a['question_id'] === $q['id'];
    });

    $results[] = [
        'question' => $q,
        'answers' => array_values($relatedAnswers),
    ];
}

// Return JSON response
sendJsonResponse($results);
