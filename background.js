chrome.runtime.onInstalled.addListener(() => {
  console.log('SuperEmail Marketing extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthToken') {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError });
      } else {
        sendResponse({ success: true, token: token });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
});