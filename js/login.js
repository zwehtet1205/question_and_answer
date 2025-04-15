$(document).ready(function() {
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'invalid_credentials') {
        $('#error-message').removeClass('hidden');
    }

});