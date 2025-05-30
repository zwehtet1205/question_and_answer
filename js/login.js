$(document).ready(function () {

    // check if user is already authenticated
    $.getJSON('app/is_auth.php')
        .done(function (data) {
            if (data.is_authenticated) {

                // redirect to dashboard 
                window.location.href = data.redirect_url || 'dashboard.html';
            } else {
                console.log('User is not logged in');
            }
        })
        .fail(function (xhr, status, error) {
            console.error('Auth check failed:', error);
        });

    // Handle login form 
    $('#login-form').on('submit', function (event) {
        event.preventDefault();

        // get username and password
        const username = $('#user_name').val().trim();
        const password = $('#hashed_password').val().trim();

        // check field are filled 
        if (!username || !password) {
            $('#error-message').text('Username and password are required.').removeClass('hidden');
            return;
        }

        // send login
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

                    // redirect to dashboard 
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
