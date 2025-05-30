function signOut() {
    // function to handle user sign out
    $.get('app/sign_out.php', function (data) {
        if (data.success) {
            // redirect to login page
            window.location.href = 'index.html';
        }
    });
}
