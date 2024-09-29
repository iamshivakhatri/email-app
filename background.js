chrome.runtime.onInstalled.addListener(() => {
    console.log('Super Email Extension is installed');
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    console.log("hello ")
    if (request.action === 'getGoogleAuthToken') {
      chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError });
        } else {
          sendResponse({ token: token });
          console.log('Token acquired:', token);
        }
      });
      return true; // Indicates that the response is sent asynchronously
    }
  });
  
  async function fetchSheetData(sheetId) {
    const token = await new Promise((resolve) => 
      chrome.identity.getAuthToken({ interactive: true }, resolve)
    );
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  
    if (!response.ok) {
      throw new Error('Failed to fetch sheet data');
    }
  
    return response.json();
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchSheetData') {
      fetchSheetData(request.sheetId)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Indicates that the response is sent asynchronously
    }
  });