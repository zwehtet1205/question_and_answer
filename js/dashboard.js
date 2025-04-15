// Preloader
$(window).on('load', function() {
    $('#preloader').css({ 'transition': 'opacity 0.5s ease', 'opacity': '0' });
    setTimeout(function() {
        $('#preloader').hide();
    }, 500);
});
$(document).ready(function () {

    // Check user login or not
    $.ajax({
        url: 'app/check_login.php',
        dataType: 'json',
        success: function(data) {
            if (data.logged_in) {
                // User is logged in
                console.log('User is logged in');
            } else {
                // User is not logged in, redirect to login page
                window.location.href = 'index.html';
            }
        },
        error: function(xhr, status, error) {
            console.error('Login check failed:', error);
        }
    })



    // Notification 
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');

    function showNotification(message, type) {
        const isError = type === 'error';
        $('#notification-message').text(message);
        $('#notification')
            .removeClass('hidden bg-red-500 bg-green-500 text-white')
            .addClass(isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white')
            .css({ 'opacity': '0' })
            .animate({ 'opacity': '1' }, 300);
        
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            $('#notification').animate({ 'opacity': '0' }, 300, function() {
                $(this).addClass('hidden');
            });
        }, 5000);
    }

    if (error === 'profanity_detected') {
        showNotification('Profanity detected in your question. Please revise and submit again.', 'error');
    } else if (success === 'question_submitted') {
        showNotification('Your question has been submitted successfully!', 'success');
    } else if (success === 'answer_posted') {
        showNotification('Your answer has been posted successfully!', 'success');
    }

    // Get all modules 
    $.ajax({
        url: 'app/get_modules.php',
        dataType: 'json',
        success: function(data) {
            // console.log('Modules fetched:', data); // Debugging line to check fetched modules
            
            // console.log(data);

            let html = ``;

            if (Array.isArray(data)) {
                data.forEach(item => {
                    console.log(item);
                    console.log(item.code);
                    html += `<option value="${item.code}">${item.name}</option>`;
                });
            } else {
                console.error('Invalid data format: Expected an array', data);
                html = '<option>No modules available.</option>';
            }

            

            $('#module').html(html || '<option>No modules available.</option>');
            $('#filter-module').html(`<option value>All Modules</option>`+html || '<option>No modules available.</option>');
        },
        error: function(xhr, status, error) {
            console.error('Module fetch failed:', error);
        }
    });

    // Get all questions
    $.ajax({
        url: 'app/questions.php',
        dataType: 'json',
        success: function(data) {

            // console.log('Questions fetched:', data); 
            if (!Array.isArray(data)) {
                $('#question-list').html('<p>No questions found or invalid data format.</p>');
                return;
            }

            const html = data.map(item => {
                const answers = item.answers.map(answer => `
                    <p class="text-secondary">${answer.answer || 'No answer text'}</p>
                    <p class="text-sm text-gray-600 mt-2">
                        Answered by <span class="text-gray-900">${answer.answered_by || 'Unknown'}</span> on 
                        ${new Date(answer.timestamp || Date.now()).toLocaleString()}
                    </p>
                `).join('');


                return `
                    <div class="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-12 text-center priority-form">
                                <button class="text-gray-500 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-yellow-600 vote" data-id="${item.question.id}" aria-label="Vote up question">
                                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                </button>
                                <div class="text-sm font-medium text-gray-700 priority">${item.question.priority || 0}</div>
                            </div>
                            <div class="flex-1 ml-4">
                                <h3 class="text-lg font-semibold text-gray-700">
                                    <a href="#q${item.question.id}" class="text-primary hover:text-secondary focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-colors duration-300">
                                        ${item.question.question || 'Untitled Question'}
                                    </a>
                                </h3>
                                <p class="text-sm text-gray-600 mt-1">
                                    Asked by <span class="text-gray-900">${item.question.asked_by || 'User1'}</span> on 
                                    ${new Date(item.question.timestamp || Date.now()).toLocaleString()} | 
                                    Module: <span class="text-gray-900">${item.question.module || 'Unknown'}</span>
                                </p>
                                <div class="mt-4 border-t border-gray-200 pt-4">
                                    ${answers || '<p class="text-secondary">No answers yet.</p>'}
                                    <form action="app/post_answer.php" method="POST" class="mt-4 space-y-4 hidden" id="answer-form-q${item.question.id}">
                                        <input type="hidden" name="question_id" value="${item.question.id}">
                                        <div>
                                            <label for="answer-q${item.question.id}" class="block text-sm font-medium text-primary">Your Answer</label>
                                            <textarea id="answer-q${item.question.id}" name="answer" rows="3" required 
                                                class="mt-1 w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all duration-300" 
                                                aria-required="true"></textarea>
                                        </div>
                                        <button type="submit" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all duration-300 font-medium">
                                            Post Answer
                                        </button>
                                    </form>
                                    <button class="answer-form-toggle text-sm text-gray-700 hover:text-yellow-600 mt-2 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-colors duration-300 hidden" 
                                        onclick="toggleAnswerForm('q${item.question.id}')" 
                                        id="toggle-answer-q${item.question.id}" 
                                        aria-label="Toggle answer form">Answer as Staff</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // console.log('Generated HTML:', html); // Debugging line to check generated HTML

            $('#question-list').html(html || '<p>No questions found.</p>');
        },
        error: function(xhr, status, error) {
            console.error('Questions fetch failed:', error);
            $('#question-list').html('<p>Error loading questions. Please try again later.</p>');
        }
    });

    // Get role of logged-in user
    $.ajax({
        url: 'app/get_role.php',
        dataType: 'json',
        success: function(data) {  // Fixed typo: successs -> success
            const role = data.role;
            if (role === 'student') {

            } else if (role === 'staff') {
                $('#ask-question-form').remove();
                $('.answer-form-toggle').removeClass('hidden'); // Show answer buttons for staff
            }
        },
        error: function(xhr, status, error) {
            console.error('Role fetch failed:', error);
        }
    });

    // set answer form toggle function globally
    window.toggleAnswerForm = function(questionId) {
        const form = $(`#answer-form-${questionId}`);
        const toggleButton = $(`#toggle-answer-${questionId}`);
        form.toggleClass('hidden');
        toggleButton.toggleClass('hidden');
    }
    // handle filter questions
    function filterQuestions() {
        const selectedModule = $('#filter-module').val();
        const selectedStatus = $('#filter-status').val();

        $.ajax({
            url: 'app/questions.php',
            dataType: 'json',
            data: {
                module: selectedModule,
                status: selectedStatus
            },
            success: function(data) {
    
                // console.log('Questions fetched:', data); 
                if (!Array.isArray(data)) {
                    $('#question-list').html('<p>No questions found or invalid data format.</p>');
                    return;
                }
    
                const html = data.map(item => {
                    const answers = item.answers.map(answer => `
                        <p class="text-secondary">${answer.answer || 'No answer text'}</p>
                        <p class="text-sm text-gray-600 mt-2">
                            Answered by <span class="text-gray-900">${answer.answered_by || 'Unknown'}</span> on 
                            ${new Date(answer.timestamp || Date.now()).toLocaleString()}
                        </p>
                    `).join('');
    
                    return `
                        <div class="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                            <div class="flex items-start">
                                <div class="flex-shrink-0 w-12 text-center priority-form">
                                    <button class="text-gray-500 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 vote" data-id="${item.question.id}" aria-label="Vote up question">
                                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                        </svg>
                                    </button>
                                    <div class="text-sm font-medium text-gray-700 priority">${item.question.priority || 0}</div>
                                </div>
                                <div class="flex-1 ml-4">
                                    <h3 class="text-lg font-semibold text-gray-700">
                                        <a href="#q${item.question.id}" class="text-primary hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-colors duration-300">
                                            ${item.question.question || 'Untitled Question'}
                                        </a>
                                    </h3>
                                    <p class="text-sm text-gray-600 mt-1">
                                        Asked by <span class="text-gray-900">${item.question.asked_by || 'Unknown'} </span> on 
                                        ${new Date(item.question.timestamp || Date.now()).toLocaleString()} | 
                                        Module: <span class="text-gray-900">${item.question.module || 'Unknown'}</span>
                                    </p>
                                    <div class="mt-4 border-t border-gray-200 pt-4">
                                        ${answers || '<p class="text-secondary">No answers yet.</p>'}
                                        <form action="app/answer.php" method="POST" class="mt-4 space-y-4 hidden" id="answer-form-q${item.question.id}">
                                            <input type="hidden" name="question_id" value="${item.question.id}">
                                            <div>
                                                <label for="answer-q${item.question.id}" class="block text-sm font-medium text-gray-700">Your Answer</label>
                                                <textarea id="answer-q${item.question.id}" name="answer" rows="3" required 
                                                    class="mt-1 w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all duration-300" 
                                                    aria-required="true"></textarea>
                                            </div>
                                            <button type="submit" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all duration-300 font-medium">
                                                Post Answer
                                            </button>
                                        </form>
                                        <button class="answer-form-toggle text-sm text-gray-700 hover:text-yellow-600 mt-2 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-colors duration-300 hidden" 
                                            onclick="toggleAnswerForm('q${item.question.id}')" 
                                            id="toggle-answer-q${item.question.id}" 
                                            aria-label="Toggle answer form">Answer as Staff</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
    
                // console.log('Generated HTML:', html); // Debugging line to check generated HTML
    
                $('#question-list').html(html || '<p>No questions found.</p>');
            },
            error: function(xhr, status, error) {
                console.error('Questions fetch failed:', error);
                $('#question-list').html('<p>Error loading questions. Please try again later.</p>');
            }
        });
    }
    $('#filter-module').on('change', function() {
        // console.log("change module");
        filterQuestions();
    });

    $('#filter-status').on('change', function() {
        // console.log("change status");
        filterQuestions();
    });

    //handle vote question 
    $('#question-list').on('click', '.vote', function() {
        const questionId = $(this).data('id');
        console.log("vote question", questionId);
        $.ajax({
            url: 'app/vote_question.php',
            type: 'POST',
            data: { question_id: questionId },
            success: function(response) {

                // Update the priority number in the UI
                $(`#question-list .vote[data-id="${questionId}"]`).closest('.priority-form').find('.priority').text(response || 0);

            },
            error: function(xhr, status, error) {
                console.error('Vote failed:', error);
            }
        });
    });

    
});

