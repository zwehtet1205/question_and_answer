<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $_SESSION['role'] !== 'student') {
    header('Location: ../index.html');
    exit;
}

$module = trim($_POST['module']);
$question = trim($_POST['question']);

// Read banned words
$banned_words = file('../data/banned_words.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($banned_words as $word) {
    if (stripos($question, $word) !== false) {
        header('Location: ../submit_question.html?error=profanity_detected');
        exit;
    }
}

// Read and update questions.json
$questions = json_decode(file_get_contents('../data/questions.json'), true) ?: [];
$new_question = [
    'id' => count($questions) + 1,
    'module' => htmlspecialchars($module),
    'question' => htmlspecialchars($question),
    'priority' => 0,
    'asked_by' => $_SESSION['username'],
    'timestamp' => gmdate('c')
];
$questions[] = $new_question;
file_put_contents('../data/questions.json', json_encode($questions, JSON_PRETTY_PRINT));

header('Location: ../submit_question.html?success=question_submitted');
exit;
?>