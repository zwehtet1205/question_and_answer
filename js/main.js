
$(document).ready(function () {
    const questionList = $('#question-list');
    const filterModule = $('#filter-module');
    const filterStatus = $('#filter-status');
    
    const notification = $('#notification');
    const notificationMessage = $('#notification-message');

    function showNotification(message, type) {
        const isError = type === 'error';
        notificationMessage.text(message);
        notification.removeClass('hidden bg-red-500 bg-green-500 text-white').addClass(isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white').css({ opacity: '0' }).animate({ opacity: '1' }, 300);

        setTimeout(() => {
            notification.animate({ opacity: '0' }, 300, () => notification.addClass('hidden'));
        }, 5000);
    }

    checkLoginStatus();
    fetchModules();
    fetchQuestions();
    fetchUserRole();
    handleURLNotifications();

    filterModule.on('change', () => applyFilters());
    filterStatus.on('change', () => applyFilters());

    questionList.on('click', '.vote-btn.upvote', function () {
        console.log('clicked');
        const questionId = $(this).data('id');
        if (questionId) voteQuestion(questionId);
    });

    questionList.on('click', '.vote-btn.downvote', function () {
        console.log('clicked');
        const questionId = $(this).data('id');
        if (questionId) downVoteQuestion(questionId);
    });

    $('#ask-question-form').on('submit', function (e) {
        e.preventDefault();
        const module = $('#module').val();
        const question = $('#question').val();
        if (module && question) askQuestion(module, question);
    });

    function fetchModules() {
        $.getJSON('app/modules.php')
            .done(data => {
                const options = Array.isArray(data)
                    ? data.map(item => `<option value="${item.code}">${item.name}</option>`).join('')
                    : '<option>No modules available.</option>';

                $('#module').html(options);
                filterModule.html(`<option value="">All Modules</option>${options}`);
            })
            .fail(error => {
                console.error('Module fetch failed:', error);
                $('#module, #filter-module').html('<option>Error loading modules.</option>');
            });
    }

    function fetchQuestions(filters = {}) {
        $.getJSON('app/questions.php', filters)
            .done(data => {
                console.log(data);
                renderQuestions(data.questions);
                $('#quick-stats-section #total-questions').html(data.total_questions);
                $('#quick-stats-section #answered').html(data.total_answered_questions);
                $('#quick-stats-section #unanswered').html(data.total_unanswered_questions);
            })
            .fail(error => {
                console.error('Questions fetch failed:', error);
                questionList.html('<p class="text-red-400">Error loading questions.</p>');
            });
    }

    function fetchUserRole() {
        $.getJSON('app/user_type.php')
            .done(data => {
                $('#ask-question-form-container').toggleClass('hidden', data.type !== 'student');
            })
            .fail(error => console.error('Role fetch failed:', error));
    }

    function checkLoginStatus() {
        $.getJSON('app/is_auth.php')
            .done(data => {
                if (!data.is_authenticated) window.location.href = 'index.html';
            })
            .fail(error => {
                console.error('Login check failed:', error);
                questionList.html('<p class="text-red-400">Error checking login status.</p>');
            });
    }

    function renderQuestions(data) {
        if (!Array.isArray(data)) {
            questionList.html('<p class="text-gray-300">No questions found or invalid data format.</p>');
            return;
        }

        const html = data.map((q) => {
            const voteCount = q.votes || 0;
            const askedBy = q.asked_by || 'Unknown User';
            const answeredBadge = q.answered
                ? '<span class="text-xs font-semibold px-2 py-1 rounded answered">Answered</span>'
                : '<span class="text-xs font-semibold px-2 py-1 rounded unanswered">Unanswered</span>';

            return `
                <article class="glass p-6 rounded-xl" role="article" aria-labelledby="question-${q.id}">
                    <div class="flex gap-4">
                        <!-- Vote Section -->
                        <div class="flex flex-col items-center gap-1 w-10 vote-form">
                            <button type="button" class="vote-btn upvote text-gray-400 hover:text-green-500 transition" data-id="${q.id}" aria-label="Upvote">
                                <i class="fas fa-chevron-up text-xl"></i>
                            </button>
                            <span class="vote-count text-sm font-semibold">${voteCount}</span>
                            <button type="button" class="vote-btn downvote text-gray-400 hover:text-red-500 transition" data-id="${q.id}" aria-label="Downvote">
                                <i class="fas fa-chevron-down text-xl"></i>
                            </button>
                        </div>

                        <!-- Question Content -->
                        <div class="flex-1">
                            <h3 id="question-${q.id}" class="text-lg font-semibold cursor-pointer hover:text-[var(--primary-color)] transition-colors">
                                ${q.question || 'Untitled Question'}
                            </h3>
                            <p class="text-sm mt-2">
                                Posted in <span class="primary-text font-medium">${q.module || 'Unknown Module'}</span> —
                                <span class="italic">${timeSince(new Date(q.timestamp || Date.now()))} ago</span>
                            </p>
                            <div class="mt-3 text-sm flex flex-wrap gap-2">
                                Asked by <span class="italic primary-text">${askedBy}</span> 
                            </div>
                            <div class="mt-4 flex justify-between items-center">
                                ${answeredBadge}
                                <a href="question_detail.html?id=${q.id}" class="text-sm font-medium text-[var(--primary-color)] link-hover">View Answers →</a>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        questionList.html(html || '<p class="text-gray-300">No questions found.</p>');
    }

    function voteQuestion(id) {
        $.post('app/up_vote.php', { question_id: id }, 'json')
            .done(response => {
                updateVoteCount(id, response.vote_count || 0);
                showNotification('Question voted successfully.', 'success');
            })
            .fail(xhr => handleVoteError(xhr, 'voted'));
    }

    function downVoteQuestion(id) {
        $.post('app/down_vote.php', { question_id: id }, 'json')
            .done(response => {
                updateVoteCount(id, response.vote_count || 0);
                showNotification('Question unvoted successfully.', 'success');
            })
            .fail(xhr => handleVoteError(xhr, 'unvoted'));
    }

    function updateVoteCount(questionId, count) {
        $(`.vote-btn[data-id="${questionId}"]`).closest('.vote-form').find('.vote-count').text(count);
    }

    function handleVoteError(xhr, action) {
        const msg = xhr.status === 409 
        ? `Question already ${action}.` 
        : xhr.status == 401 
        ? `You are not allowed to ${action} this question.` 
        : `Error while trying to ${action} the question.`;
        showNotification(msg, 'error');
    }


    function timeSince(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];
        for (const { label, seconds: s } of intervals) {
            const count = Math.floor(seconds / s);
            if (count > 0) return `${count} ${label}${count > 1 ? 's' : ''}`;
        }
        return 'just now';
    }

    function applyFilters() {
        fetchQuestions({
            module: filterModule.val(),
            status: filterStatus.val()
        });
    }

    function handleURLNotifications() {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const success = params.get('success');

        if (error === 'profanity_detected') showNotification('Profanity detected in your question.', 'error');
        if (success === 'question_submitted') showNotification('Your question has been submitted.', 'success');
        if (success === 'answer_posted') showNotification('Your answer has been posted.', 'success');
    }

    function askQuestion(module, question) {
        $.post('app/ask.php', { module, question }, 'json')
            .done(response => {
                const { status, questions, error } = response;
    
                if (status !== 'success') {
                    showNotification(error || 'Failed to submit question.', 'error');
                    return;
                }
    
                showNotification('Question submitted successfully.', 'success');
                $('#ask-question-form')[0].reset();
                renderQuestions(questions);
    
                // Update question stats
                const $totalQ = $('#quick-stats-section #total-questions');
                const $unansweredQ = $('#quick-stats-section #unanswered');
    
                let total = parseInt($totalQ.text(), 10) || 0;
                let unanswered = parseInt($unansweredQ.text(), 10) || 0;
    
                total++;
                unanswered++;
    
                $totalQ.text(total);
                $unansweredQ.text(unanswered);

                showNotification(response.message,'success')
            })
            .fail((xhr,status,error) => {
                console.error('Question submission failed:', xhr);

                showNotification(xhr.responseJSON, 'error');
            });
    }
    



    window.toggleAnswerForm = function (questionId) {
        $(`#answer-form-${questionId}, #toggle-answer-${questionId}`).toggleClass('hidden');
    };
});