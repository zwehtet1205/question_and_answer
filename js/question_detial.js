$(window).on('load', function () {
    $('#preloader').css({ transition: 'opacity 0.5s ease', opacity: 0 });
    setTimeout(() => $('#preloader').hide(), 800);
});

$(document).ready(function () {
    const notification = $('#notification');
    const notificationMessage = $('#notification-message');
    const answerSection = $('#answer-section');
    const questionId = getQueryParam('id');

    function showNotification(message, type) {
        const isError = type === 'error';
        notificationMessage.text(message);
        notification
            .removeClass('hidden bg-red-500 bg-green-500 text-white')
            .addClass(isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white')
            .css({ opacity: 0 })
            .animate({ opacity: 1 }, 300);

        setTimeout(() => {
            notification.animate({ opacity: 0 }, 300, () => notification.addClass('hidden'));
        }, 5000);
    }

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function decodeHTMLEntities(str) {
        return $('<textarea>').html(str).text();
    }

    function updateVoteCount(questionId, count) {
        $(`.vote-btn[data-id="${questionId}"]`).closest('.vote-form').find('.vote-count').text(count);
    }

    function handleVoteError(xhr, action) {
        console.log
        const msg = xhr.status === 409
            ? `Question already ${action}.`
            : xhr.status == 401 
            ? `You are not allowed to ${action} this question.` 
            : `Error while trying to ${action} the question.`;
        
        showNotification(msg, 'error');
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

    if (!questionId) {
        alert("No question ID provided.");
        return;
    }

    $.ajax({
        type: 'GET',
        url: 'app/get_question.php',
        data: { id: questionId },
        dataType: 'json',
        success: function (data) {
            if (data.error || !data.question) {
                alert(data.error || 'Question not found.');
                return;
            }

            const q = data.question;
            const answers = data.answers || [];

            const questionText = decodeHTMLEntities(q.question || 'Untitled question');
            const askedBy = decodeHTMLEntities(q.asked_by || 'Unknown');
            const module = decodeHTMLEntities(q.module || 'Unknown Module');
            const date = new Date(q.timestamp).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            // Set question title
            $('h1').text(questionText);

            // Metadata and voting
            $('.vote-btn.upvote, .vote-btn.downvote').attr('data-id', q.id);
            $('input[name="question_id"]').val(q.id);
            $('.vote-count').text(q.votes || 0);

            $('.text-gray-400.mb-4').html(`
                Asked by <span class="primary-text font-semibold">${askedBy}</span>
                on <span class="italic">${date}</span>
                in <span class="primary-text px-2 rounded font-medium">${module}</span>
            `);

            // Render Answers
            answerSection.find('.glass').remove(); // Clear old content

            if (answers.length === 0) {
                answerSection.append('<p class="text-gray-400" id="no-answer">No answers yet.</p>');
            } else {
                answers.forEach(answer => {
                    const answerText = decodeHTMLEntities(answer.answer || '');
                    const answeredBy = decodeHTMLEntities(answer.answered_by || 'Anonymous');
                    const answerDate = new Date(answer.timestamp).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                    });

                    answerSection.append(`
                        <div class="glass p-5 rounded-xl border border-gray-700">
                            <p class="text-[var(--text-primary)] leading-relaxed">${answerText}</p>
                            <p class="text-sm text-gray-400 mt-3">
                                Answered by <span class="primary-text font-medium">${answeredBy}</span>
                                on <span class="italic">${answerDate}</span>
                            </p>
                        </div>
                    `);
                });


            }
        },
        error: function (xhr, status, error) {
            console.error('Question fetch error:', error);
            alert('Failed to load question. Please try again later.');
        }
    });

    function fetchUserRole() {
        $.getJSON('app/user_type.php')
            .done(data => {
                if (data.type === 'student') {
                    $('#answer-form-container').addClass('hidden');
                } else {
                    $('#answer-form-container').removeClass('hidden');
                }
            })
            .fail((xhr, status, error) => {
                console.error('User role fetch error:', error);
            });
    }

    fetchUserRole();

    $(document).on('click', '.vote-btn.upvote', function () {
        const id = $(this).data('id');
        if (id) voteQuestion(id);
    });

    $(document).on('click', '.vote-btn.downvote', function () {
        const id = $(this).data('id');
        if (id) downVoteQuestion(id);
    });

    $('#answer-form').on('submit',function(e){
        e.preventDefault();
        const formData = $(this).serialize();
        $.post('app/answer.php',formData,'json')
        .done((data)=>{
            answerSection.append(`
            <div class="glass p-5 rounded-xl border border-gray-700">
                            <p class="text-[var(--text-primary)] leading-relaxed">${data.new_answer.answer}</p>
                            <p class="text-sm text-gray-400 mt-3">
                                Answered by <span class="primary-text font-medium">${data.new_answer.answered_by}</span>
                                on <span class="italic">${new Date(data.new_answer.timestamp).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                })}</span>
                            </p>
                        </div>
            `)
            answerSection.find('#no-answer').remove();
            showNotification(data.message,'success')
        })
        .fail(xhr=>{
            showNotification(xhr.responseJSON,'error')
        })
    })
});
