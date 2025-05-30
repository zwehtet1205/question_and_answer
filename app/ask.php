<?php

// include helpers
require_once 'helpers.php';

// start session 
startSession();

// check method is post 
checkRequestMethod('POST');

// check if use is student
if (getSessionVariable('user_type') !== 'student') {
    sendErrorResponse(403,'Unauthorized');
}

// get and clean input data
$module = sanitizeInput($_POST['module'] ?? '');
$questionText = sanitizeInput($_POST['question'] ?? '');

// check if inputs are valid 
if ($module === '' || $questionText === '') {
    sendErrorResponse(400,'Invalid input data.');
}

// get banned words
$bannedWords = file('../data/banned_words.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($bannedWords as $word) {
    $word = trim($word);

    // skip empty lines and comments
    if ($word === '' || $word[0] === '#') continue;

    // check if input contians banned words 
    if (stripos($questionText, $word) !== false) {
        sendErrorResponse(400,'Your question contains banned words. Please revise it.'  );
    }
}

// get existing questions
$questions = readJsonFile('../data/questions.json');

// get existing answers
$answers = readJsonFile('../data/answers.json');

// get answered question IDs
$answeredIds = array_column($answers, 'question_id');

// create new question 
$newQuestion = [
    'id'        => count($questions) + 1,
    'module'    => $module,
    'question'  => $questionText,
    'vote'  => 0,
    'asked_by'  => getSessionVariable('user_name'),
    'timestamp' => gmdate('c'),
];

// save question
$questions[] = $newQuestion;
writeJsonFile('../data/questions.json', $questions);

// update question votes and answered status
foreach ($questions as &$q) {
    $q['votes'] = getVotes($q['id']);
    $q['answered'] = in_array($q['id'], $answeredIds);
}
unset($q);

// sort questions by votes
usort($questions, function ($a, $b) {
    return $b['votes'] <=> $a['votes'];
});

// send json response
sendJsonResponse([
    'status' => 'success',
    'message' => 'Your question submitted successfully',
    'questions' => $questions,
    'new_question' => $newQuestion
]);
