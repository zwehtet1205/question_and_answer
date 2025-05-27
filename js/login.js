$(document).ready(function () {

    // Check if user is already authenticated
    $.getJSON('app/is_auth.php')
        .done(function (data) {
            if (data.is_authenticated) {
                window.location.href = data.redirect_url || 'dashboard.html';
            } else {
                console.log('User is not logged in');
            }
        })
        .fail(function (xhr, status, error) {
            console.error('Auth check failed:', error);
            $('#question-list').html('<p class="text-red-400">Error checking login status. Please try again later.</p>');
        });

    // Handle login form submission
    $('#login-form').on('submit', function (event) {
        event.preventDefault();

        const username = $('#user_name').val().trim();
        const password = $('#hashed_password').val().trim();

        if (!username || !password) {
            $('#error-message').text('Username and password are required.').removeClass('hidden');
            return;
        }

        $.ajax({
            type: 'POST',
            url: 'app/sign_in.php',
            data: { 
                "user_name": username, 
                "hashed_password": password 
            },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    window.location.href = response.redirect_url || 'dashboard.html';
                } else {
                    $('#error-message').text(response.message || 'Login failed.').removeClass('hidden');
                }
            },
            error: function (xhr, status, error) {
                console.error('Login error:', error);
                $('#error-message').text('An error occurred while logging in. Please try again.').removeClass('hidden');
            }
        });
    });

});
