document.addEventListener('DOMContentLoaded', function() {
    const openGmailButton = document.getElementById('openGmail');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackText = document.getElementById('feedbackText');
    const submitFeedback = document.getElementById('submitFeedback');

    openGmailButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://mail.google.com' });
    });

    submitFeedback.addEventListener('click', function() {
        const feedback = feedbackText.value.trim();
        if (feedback) {
            // Send feedback to background script for processing
            chrome.runtime.sendMessage({action: 'submitFeedback', feedback: feedback}, function(response) {
                if (response && response.success) {
                    alert('Thank you for your feedback!');
                    feedbackText.value = '';
                } else {
                    alert('There was an error submitting your feedback. Please try again.');
                }
            });
        } else {
            alert('Please enter your feedback before submitting.');
        }
    });

    // Check extension status
    chrome.runtime.sendMessage({action: 'getStatus'}, function(response) {
        if (response && response.status) {
            document.getElementById('status').textContent = 'Extension Status: ' + response.status;
        }
    });

    // Add version information
    chrome.management.getSelf(function(info) {
        document.getElementById('version').textContent = 'Version: ' + info.version;
    });
});