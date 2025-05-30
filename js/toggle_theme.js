$(document).ready(function () {

    // initialize variables
    const toggle = $('#darkModeToggle');
    const body = $('#themeBody');

    // load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.addClass(savedTheme);

    // handle toggle click
    toggle.on('click', function () {
        const isLight = body.hasClass('light');
        body.toggleClass('light', !isLight);
        body.toggleClass('dark', isLight);
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
    });
});
