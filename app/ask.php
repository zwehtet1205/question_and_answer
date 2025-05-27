<?php

require_once 'helpers.php';

startSession();
checkRequestMethod('POST');

// Only allow student role
if (getSessionVariable('user_type') !== 'student') {
    redirectTo('../index.html');
}

// Sanitize form inputs
$module = sanitizeInput($_POST['module'] ?? '');
$questionText = sanitizeInput($_POST['question'] ?? '');

// Load banned words
$bannedWords = file('../data/banned_words.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($bannedWords as $word) {
    $word = trim($word);
    if ($word === '' || $word[0] === '#') continue;

    if (stripos($questionText, $word) !== false) {
        setMessage('error', 'Your question contains banned words. Please revise it.');
        redirectTo('../dashboard.html');
    }
}

// Load existing questions
$questions = readJsonFile('../data/questions.json');

// Prepare new question entry
$newQuestion = [
    'id'        => count($questions) + 1,
    'module'    => $module,
    'question'  => $questionText,
    'vote'  => 0,
    'asked_by'  => getSessionVariable('user_name'),
    'timestamp' => gmdate('c'),
];

// Save updated list
$questions[] = $newQuestion;
writeJsonFile('../data/questions.json', $questions);

// Redirect on success
redirectTo('../dashboard.html?success=question_submitted');
