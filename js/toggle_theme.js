$(document).ready(function () {
    const $toggle = $('#darkModeToggle');
    const $body = $('#themeBody');

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    $body.addClass(savedTheme);

    $toggle.on('click', function () {
        const isLight = $body.hasClass('light');
        $body.toggleClass('light', !isLight);
        $body.toggleClass('dark', isLight);
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
    });
});
