// Preloader
$(window).on('load', function () {
    $('#preloader').css({ 'transition': 'opacity 0.5s ease', 'opacity': '0' });
    setTimeout(() => $('#preloader').hide(), 500);
});

$(document).ready(function () {
    const $questionList = $('#question-list');
    const $filterModule = $('#filter-module');
    const $filterStatus = $('#filter-status');
    const $notification = $('#notification');
    const $notificationMessage = $('#notification-message');

    function showNotification(message, type) {
        const isError = type === 'error';
        $notificationMessage.text(message);
        $notification
            .removeClass('hidden bg-red-500 bg-green-500 text-white')
            .addClass(isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white')
            .css({ opacity: '0' })
            .animate({ opacity: '1' }, 300);

        setTimeout(() => {
            $notification.animate({ opacity: '0' }, 300, () => $notification.addClass('hidden'));
        }, 5000);
    }

    function fetchModules() {
        $.getJSON('app/get_modules.php')
            .done(data => {
                let html = Array.isArray(data)
                    ? data.map(item => `<option value="${item.code}">${item.name}</option>`).join('')
                    : '<option>No modules available.</option>';
                $('#module').html(html);
                $filterModule.html(`<option value="">All Modules</option>${html}`);
            })
            .fail((xhr, status, error) => {
                console.error('Module fetch failed:', error);
                $('#module, #filter-module').html('<option>Error loading modules.</option>');
            });
    }

    function renderQuestions(data) {
      if (!Array.isArray(data)) {
          $questionList.html('<p class="text-gray-300">No questions found or invalid data format.</p>');
          return;
      }

      const html = data.map(item => {
          const q = item.question;
          const answers = item.answers || [];

          const hasAnswers = answers.length > 0;
          const answeredBadge = hasAnswers
              ? '<span class="text-xs font-semibold px-2 py-1 rounded answered">Answered</span>'
              : '<span class="text-xs font-semibold px-2 py-1 rounded unanswered">Unanswered</span>';

          const askedBy = q.asked_by || 'Unknown User';

          return `
              <article class="glass p-6 rounded-xl" role="article" aria-labelledby="question-${q.id}">
                  <h3 id="question-${q.id}"
                      class="text-lg font-semibold cursor-pointer hover:text-[var(--primary-color)] transition-colors">
                      ${q.question || 'Untitled Question'}
                  </h3>
                  <p class="text-sm mt-2">
                      Posted in <span class="primary-text font-medium">${q.module || 'Unknown Module'}</span> —
                      <span class="italic">${timeSince(new Date(q.timestamp || Date.now()))} ago</span>
                  </p>
                  <div class="mt-3 text-sm flex flex-wrap gap-2">
                      Asked by <span class="italic ">${askedBy}</span> 
                  </div>
                  <div class="mt-4 flex justify-between items-center">
                      ${answeredBadge}
                      <a href="#q${q.id}" class="text-sm font-medium text-[var(--primary-color)] link-hover">View Answers →</a>
                  </div>
              </article>
          `;
      }).join('');

      $questionList.html(html || '<p class="text-gray-300">No questions found.</p>');
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
      for (const interval of intervals) {
          const count = Math.floor(seconds / interval.seconds);
          if (count > 0) {
              return `${count} ${interval.label}${count > 1 ? 's' : ''}`;
          }
      }
      return 'just now';
  }


    function fetchQuestions(filters = {}) {
        $.getJSON('app/questions.php', filters)
            .done(renderQuestions)
            .fail((xhr, status, error) => {
                console.error('Questions fetch failed:', error);
                $questionList.html('<p class="text-red-400">Error loading questions.</p>');
            });
    }

    function fetchUserRole() {
        $.getJSON('app/get_role.php')
            .done(data => {
                if (data.role === 'staff') {
                    $('#ask-question-form').remove();
                    $('.answer-form-toggle').removeClass('hidden');
                }
            })
            .fail((xhr, status, error) => {
                console.error('Role fetch failed:', error);
                $questionList.html('<p class="text-red-400">Error loading user role.</p>');
            });
    }

    function checkLoginStatus() {
        $.getJSON('app/is_auth.php')
            .done(data => {
                if (!data.is_auth) window.location.href = 'index.html';
            })
            .fail((xhr, status, error) => {
                console.error('Login check failed:', error);
                $questionList.html('<p class="text-red-400">Error checking login status.</p>');
            });
    }

    function voteQuestion(id) {
        $.post('app/vote_question.php', { question_id: id })
            .done(response => {
                $(`.vote[data-id="${id}"]`).closest('.priority-form').find('.priority').text(response || 0);
            })
            .fail(() => showNotification('Error voting on question. Please try again.', 'error'));
    }

    window.toggleAnswerForm = function (questionId) {
        $(`#answer-form-${questionId}`).toggleClass('hidden');
        $(`#toggle-answer-${questionId}`).toggleClass('hidden');
    };

    function handleURLNotifications() {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const success = urlParams.get('success');

        if (error === 'profanity_detected') showNotification('Profanity detected in your question.', 'error');
        if (success === 'question_submitted') showNotification('Your question has been submitted.', 'success');
        if (success === 'answer_posted') showNotification('Your answer has been posted.', 'success');
    }

    // Event listeners
    $filterModule.on('change', () => fetchQuestions({ module: $filterModule.val(), status: $filterStatus.val() }));
    $filterStatus.on('change', () => fetchQuestions({ module: $filterModule.val(), status: $filterStatus.val() }));
    $questionList.on('click', '.vote', function () {
        voteQuestion($(this).data('id'));
    });

    // Initialization
    checkLoginStatus();
    fetchModules();
    fetchQuestions();
    fetchUserRole();
    handleURLNotifications();
});