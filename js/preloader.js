$(window).on('load', function () {
    $('#preloader').css({ 'transition': 'opacity 0.5s ease', 'opacity': '0' });
    setTimeout(() => $('#preloader').hide(), 500);
});