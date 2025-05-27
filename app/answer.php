<?php

require_once 'helpers.php';

startSession();
checkRequestMethod('POST');

if (getSessionVariable('user_type') !== 'staff') {
    redirectTo('../index.html');
}

// Sanitize inputs
$questionId = isset($_POST['question_id']) ? (int)$_POST['question_id'] : 0;
$answerText = isset($_POST['answer']) ? sanitizeInput($_POST['answer']) : '';

if ($questionId <= 0 || $answerText === '') {
    setMessage('error', 'Invalid input data.');
    redirectTo('../dashboard.html');
}

// Load existing answers
$answers = readJsonFile('../data/answers.json');

// Add new answer
$answers[] = [
    'question_id'  => $questionId,
    'answer'       => $answerText,
    'answered_by'  => getSessionVariable('username'),
    'timestamp'    => gmdate('c'),
];

// Save answers 
writeJsonFile('../data/answers.json', $answers);

// Set success message and redirect
setMessage('success', 'Answer posted successfully.');
redirectTo('../dashboard.html');
