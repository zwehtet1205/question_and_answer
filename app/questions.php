<?php
session_start();

// Get filter values 
$module = $_GET['module'] ?? '';
$status = $_GET['status'] ?? '';

// Get all questions
$questions = json_decode(file_get_contents('../data/questions.json'), true) ?: [];

// Get all answers 
$answers = json_decode(file_get_contents('../data/answers.json'), true) ?: [];

// Get all question IDs that are answered 
$answered_ids = array_column($answers, 'question_id');

// Filter questions based on module and status
$filtered_questions = array_filter($questions, function($question) use ($module, $status, $answered_ids) {
    return ($module ? $question["module"] === $module : true) &&  
            ($status ? 
                ($status === 'answered' ?  
                    in_array($question['id'], $answered_ids) :  
                    !in_array($question['id'], $answered_ids)
                ) : 
                true
            );
});

// Sort questions 
usort($filtered_questions, function($a, $b) {
    return $b['priority'] <=> $a['priority'];
});

// Attach answers to questions
$results = [];
foreach ($filtered_questions as $question) {
    $question_answers = array_filter($answers, function($answer) use ($question) {
        return $answer['question_id'] === $question['id'];
    });

    $results[] = [
        'question' => $question,
        'answers' => array_values($question_answers)
    ];
}

// Set content type header and output JSON
header('Content-Type: application/json');
echo json_encode($results);