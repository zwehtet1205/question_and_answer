function signOut() {
    $.get('app/sign_out.php', function (data) {
        if (data.success) {
            window.location.href = 'index.html';
        }
    });
}
