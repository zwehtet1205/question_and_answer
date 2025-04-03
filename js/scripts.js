$(document).ready(function () {
  // Get current page path for scoping
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Handle login error on index.html
  if (currentPage === 'index.html') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'invalid_credentials') {
      $('#error-message').removeClass('hidden');
    }
  }

  // Fetch user role and update dashboard on dashboard.html
  if (currentPage === 'dashboard.html') {
    $.ajax({
      url: 'app/get_role.php',
      dataType: 'json',
      success: function (data) {
        const role = data.role;
        let options = '';
        if (role === 'student') {
          options = `
                      <div class="bg-white p-4 rounded shadow">
                          <h2 class="text-lg font-semibold mb-2">Student Actions</h2>
                          <a href="submit_question.html" class="block bg-green-500 text-white p-2 rounded mb-2 hover:bg-green-600">Submit a Question</a>
                          <a href="view_unanswered.html" class="block bg-blue-500 text-white p-2 rounded mb-2 hover:bg-blue-600">View Unanswered Questions</a>
                          <a href="view_answered.html" class="block bg-blue-500 text-white p-2 rounded hover:bg-blue-600">View Answered Questions</a>
                      </div>
                  `;
        } else if (role === 'staff') {
          options = `
                      <div class="bg-white p-4 rounded shadow">
                          <h2 class="text-lg font-semibold mb-2">Staff Actions</h2>
                          <a href="view_questions.html" class="block bg-blue-500 text-white p-2 rounded mb-2 hover:bg-blue-600">View All Questions</a>
                      </div>
                  `;
        }
        $('#user-options').html(options);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#user-options').html('<p class="text-red-500">Error loading role. Please <a href="index.html" class="underline">log in</a> again.</p>');
        console.error('Get role error:', textStatus, errorThrown);
      }
    });
  }

  // Handle question submission feedback on submit_question.html
  if (currentPage === 'submit_question.html' && $('#questionForm').length) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'profanity_detected') {
      $('#error-message').removeClass('hidden');
    } else if (urlParams.get('success') === 'question_submitted') {
      $('#success-message').removeClass('hidden');
    }
  }

  // Load questions for staff on view_questions.html
  if (currentPage === 'view_questions.html' && $('#questionsList').length) {
    $.ajax({
      url: 'app/view_questions.php',
      data: { module: '5530CSMM' },
      dataType: 'json',
      success: function (data) {
        let html = '';
        data.forEach(q => {
          html += `
                      <div class="bg-white p-4 rounded shadow" role="listitem">
                          <p><strong>Question:</strong> ${q.question}</p>
                          <p><strong>Priority:</strong> ${q.priority}</p>
                          <p><strong>Asked by:</strong> ${q.asked_by}</p>
                          <p><strong>Time:</strong> ${new Date(q.timestamp).toLocaleString()}</p>
                          <form action="app/post_answer.php" method="POST" class="mt-2">
                              <input type="hidden" name="question_id" value="${q.id}">
                              <label for="answer-${q.id}" class="block text-sm font-medium text-gray-700">Answer</label>
                              <textarea id="answer-${q.id}" name="answer" class="w-full p-2 border rounded" required></textarea>
                              <button type="submit" class="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Post Answer</button>
                          </form>
                      </div>
                  `;
        });
        $('#questionsList').html(html || '<p>No questions found.</p>');
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#questionsList').html('<p class="text-red-500">Error loading questions.</p>');
        console.error('View questions error:', textStatus, errorThrown);
      }
    });
  }

  // Load unanswered questions for students on view_unanswered.html
  if (currentPage === 'view_unanswered.html' && $('#questionsList').length) {
    $.ajax({
      url: 'app/view_unanswered.php',
      data: { module: '5530CSMM' },
      dataType: 'json',
      success: function (data) {
        let html = '';
        data.forEach(q => {
          html += `
                      <div class="bg-white p-4 rounded shadow" role="listitem">
                          <p><strong>Question:</strong> ${q.question}</p>
                          <p><strong>Priority:</strong> ${q.priority}</p>
                          <p><strong>Asked by:</strong> ${q.asked_by}</p>
                          <p><strong>Time:</strong> ${new Date(q.timestamp).toLocaleString()}</p>
                          <form action="app/vote_question.php" method="POST">
                              <input type="hidden" name="question_id" value="${q.id}">
                              <button type="submit" class="mt-2 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600">Vote Up</button>
                          </form>
                      </div>
                  `;
        });
        $('#questionsList').html(html || '<p>No unanswered questions.</p>');
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#questionsList').html('<p class="text-red-500">Error loading questions.</p>');
        console.error('View unanswered error:', textStatus, errorThrown);
      }
    });
  }

  // Load answered questions for students on view_answered.html
  if (currentPage === 'view_answered.html' && $('#questionsList').length) {
    $.ajax({
      url: 'app/view_answered.php',
      data: { module: '5530CSMM' },
      dataType: 'json',
      success: function (data) {
        let html = '';
        data.forEach(item => {
          html += `
                      <div class="bg-white p-4 rounded shadow" role="listitem">
                          <p><strong>Question:</strong> ${item.question.question}</p>
                          <p><strong>Priority:</strong> ${item.question.priority}</p>
                          <p><strong>Asked by:</strong> ${item.question.asked_by}</p>
                          <p><strong>Time:</strong> ${new Date(item.question.timestamp).toLocaleString()}</p>
                          <div class="mt-2">
                              <strong>Answers:</strong>
                              <ul class="list-disc pl-5">
                                  ${item.answers.map(a => `<li>${a.answer} (by ${a.answered_by} at ${new Date(a.timestamp).toLocaleString()})</li>`).join('')}
                              </ul>
                          </div>
                      </div>
                  `;
        });
        $('#questionsList').html(html || '<p>No answered questions.</p>');
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#questionsList').html('<p class="text-red-500">Error loading questions.</p>');
        console.error('View answered error:', textStatus, errorThrown);
      }
    });
  }
});