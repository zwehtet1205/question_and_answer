<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $_SESSION['role'] !== 'staff') {
    header('Location: ../index.html');
    exit;
}

$question_id = (int)$_POST['question_id'];
$answer = trim($_POST['answer']);

// Update answers.json
$answers = json_decode(file_get_contents('../data/answers.json'), true) ?: [];
$answers[] = [
    'question_id' => $question_id,
    'answer' => htmlspecialchars($answer),
    'answered_by' => $_SESSION['username'],
    'timestamp' => gmdate('c')
];
file_put_contents('../data/answers.json', json_encode($answers, JSON_PRETTY_PRINT));

header('Location: ../dashboard.html?success=answer_posted');
exit;
?>