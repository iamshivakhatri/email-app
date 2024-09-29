document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup loaded');
    const settingsBtn = document.getElementById('settings-btn');
    const feedbackBtn = document.getElementById('feedback-btn');
  
    settingsBtn.addEventListener('click', function() {
      // Implement settings functionality
      alert("Settings clicked")
      console.log('Settings clicked');
    });
  
    feedbackBtn.addEventListener('click', function() {
      // Implement feedback functionality
      console.log('Feedback clicked');
    });
  });