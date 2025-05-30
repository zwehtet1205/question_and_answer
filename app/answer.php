<?php

// include helpers
require_once 'helpers.php';

// start session 
startSession();

// check method is post
checkRequestMethod('POST');

// check if user is staff 
if (getSessionVariable('user_type') !== 'staff') {
    sendErrorResponse('401', 'Unauthorized');
}

// get and clean input data
$questionId = isset($_POST['question_id']) ? (int)$_POST['question_id'] : 0;
$answerText = isset($_POST['answer']) ? sanitizeInput($_POST['answer']) : '';

// check is inputs are valid 
if ($questionId <= 0 || $answerText === '') {
    sendErrorResponse('400', 'Invalid input data.');
}

// get banned words
$bannedWords = file('../data/banned_words.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach ($bannedWords as $word) {
    $word = trim($word);

    // skip empty lines and comments
    if ($word === '' || $word[0] === '#') continue;

    // check if input contains banned words 
    if (stripos($answerText, $word) !== false) {
        sendErrorResponse(400,'Your answer contains banned words. Please revise it.'  );
    }
}

// get existing answers
$answers = readJsonFile('../data/answers.json');

// add new answer
$answers[] = [
    'question_id'  => $questionId,
    'answer'       => $answerText,
    'answered_by'  => getSessionVariable('user_name'),
    'timestamp'    => gmdate('c'),
];

// save answers 
writeJsonFile('../data/answers.json', $answers);

// send json response
sendJsonResponse([
    'status' => 'success',
    'message' => 'Answer posted successfully.',
    'answers' => $answers,
    'new_answer' => [
        'question_id'  => $questionId,
        'answer'       => $answerText,
        'answered_by'  => getSessionVariable('user_name'),
        'timestamp'    => gmdate('c'),
    ]
]);
