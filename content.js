// Global variables
let recipientButton;
let templatePopup;
let templates = JSON.parse(localStorage.getItem('emailTemplates')) || [
  { name: 'Marketing Email', content: 'Hello [Firstname],\n\nWe have an exciting offer for you...' },
  { name: 'Follow-Up Email', content: 'Hi [Firstname],\n\nI hope this email finds you well. I wanted to follow up on...' },
  { name: 'Reminder Email', content: 'Dear [Firstname],\n\nThis is a friendly reminder about...' },
  { name: 'Welcome Email', content: 'Welcome, [Firstname]!\n\nWe\'re thrilled to have you on board...' },
  { name: 'Thank You Email', content: 'Dear [Firstname],\n\nThank you for your recent...' }
];

let recipients = [];
let selectedTemplate = null;
// Initialize the extension
function initializeExtension() {
  if (window.location.hostname === 'mail.google.com') {
    console.log('Initializing SuperEmail Marketing extension');
    createRecipientButton();
    createTemplatePopup();
    setupEmailBodyListener();
    setupDragAndDrop();
    createCustomSendButton(); // Add this line
  }
}

// Create and inject the recipient button
function createRecipientButton() {
  const composeObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        const composeBox = document.querySelector('.aoD.hl');
        if (composeBox && !document.getElementById('superEmailRecipientButton')) {
          recipientButton = document.createElement('button');
          recipientButton.textContent = 'Import Recipients';
          recipientButton.id = 'superEmailRecipientButton';
          recipientButton.addEventListener('click', handleRecipientButtonClick);
          composeBox.parentNode.insertBefore(recipientButton, composeBox.nextSibling);
          composeObserver.disconnect();
          break;
        }
      }
    }
  });
  
  composeObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Handle recipient button click
function handleRecipientButtonClick() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.addEventListener('change', handleFileUpload);
  input.click();
}

// Handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.type !== 'text/csv') {
      showNotification('Error: Please upload a CSV file.', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      parseCSV(content);
    };
    reader.onerror = (e) => {
      showNotification('Error: Failed to read the file.', true);
    };
    reader.readAsText(file);
  }
}

// Parse CSV content
function parseCSV(content) {
  const rows = content.split('\n');
  const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
  const emailIndex = headers.findIndex(header => header === 'email');
  const nameIndex = headers.findIndex(header => header === 'name');
  
  if (emailIndex === -1) {
    showNotification('Error: CSV file must contain an "Email" column', true);
    return;
  }
  
  const recipients = rows.slice(1)
    .map(row => {
      const columns = row.split(',').map(col => col.trim());
      return {
        email: columns[emailIndex],
        name: nameIndex !== -1 ? columns[nameIndex] : ''
      };
    })
    .filter(recipient => recipient.email && recipient.email.includes('@'));
  
  if (recipients.length === 0) {
    showNotification('Error: No valid email addresses found in the CSV file.', true);
    return;
  }
  
  populateRecipients(recipients);
}

// Function to find the recipient field
function findRecipientField() {
  const selectors = [
    'input[name="to"]',
    'input[aria-label="To"]',
    'input[aria-label="Recipients"]',
    'input[role="combobox"]'
  ];

  for (let selector of selectors) {
    const field = document.querySelector(selector);
    if (field) return field;
  }

  return null;
}

// Function to wait for the recipient field to be available
function waitForRecipientField(maxAttempts = 10, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkField = () => {
      const field = findRecipientField();
      if (field) {
        resolve(field);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkField, interval);
      } else {
        reject(new Error('Recipient field not found'));
      }
    };

    checkField();
  });
}

// Populate recipients in Gmail compose window
function populateRecipients(newRecipients) {
    recipients = newRecipients;
  waitForRecipientField()
    .then(toField => {
      const recipientString = recipients.map(r => r.name ? `${r.name} <${r.email}>` : r.email).join(', ');
      toField.value = recipientString;
      toField.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('Recipients populated:', recipientString);
      showNotification(`Successfully imported ${recipients.length} email addresses.`);
    })
    .catch(error => {
      console.error('Error finding recipient field:', error);
      showNotification('Error: Could not find the recipient field. Please make sure you are in the Gmail compose window and try again.', true);
    });
}

// Create template popup
function createTemplatePopup() {
  templatePopup = document.createElement('div');
  templatePopup.id = 'superEmailTemplatePopup';
  templatePopup.style.display = 'none';
  templatePopup.innerHTML = `
    <div id="templatePopupHeader">Email Templates<span id="closeTemplatePopup">&times;</span></div>
    <div id="templateList"></div>
  `;
  document.body.appendChild(templatePopup);

  const templateList = document.getElementById('templateList');
  templates.forEach((template, index) => {
    const templateButton = document.createElement('button');
    templateButton.textContent = template.name;
    templateButton.addEventListener('click', () => loadTemplate(index));
    templateList.appendChild(templateButton);
  });

  document.getElementById('closeTemplatePopup').addEventListener('click', () => {
    templatePopup.style.display = 'none';
  });

  makeDraggable(templatePopup);
}

// Make an element draggable
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = document.getElementById('templatePopupHeader');
  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Setup email body listener
function setupEmailBodyListener() {
  document.addEventListener('input', function(e) {
    if (e.target.getAttribute('role') === 'textbox' && e.target.getAttribute('aria-label') === 'Message Body') {
      const content = e.target.textContent;
      if (content.endsWith('#')) {
        showTemplatePopup(e.target);
      }
    }
  });
}

// Show template popup
function showTemplatePopup(target) {
  const rect = target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  // Calculate available space below and above the cursor
  const spaceBelow = window.innerHeight - (rect.bottom - scrollTop);
  const spaceAbove = rect.top - scrollTop;

  // Set initial position
  let top = rect.bottom + scrollTop;
  let left = rect.left + scrollLeft;

  // Check if there's not enough space below, and more space above
  if (spaceBelow < 200 && spaceAbove > spaceBelow) {
    top = rect.top + scrollTop - 200; // Assume popup height of 200px
  }

  // Ensure the popup doesn't go off the right edge of the screen
  if (left + 250 > window.innerWidth) { // Assume popup width of 250px
    left = window.innerWidth - 260; // 10px margin
  }

  templatePopup.style.display = 'block';
  templatePopup.style.position = 'absolute';
  templatePopup.style.top = `${top}px`;
  templatePopup.style.left = `${left}px`;

  // Ensure the popup is within the viewport
  const popupRect = templatePopup.getBoundingClientRect();
  if (popupRect.bottom > window.innerHeight) {
    top -= popupRect.bottom - window.innerHeight + 10; // 10px margin
    templatePopup.style.top = `${top}px`;
  }
  if (popupRect.right > window.innerWidth) {
    left -= popupRect.right - window.innerWidth + 10; // 10px margin
    templatePopup.style.left = `${left}px`;
  }
}

// Load selected template into Gmail compose window
// Modify the loadTemplate function
function loadTemplate(index) {
    selectedTemplate = templates[index];
    const bodyField = document.querySelector('div[role="textbox"][aria-label="Message Body"]');
    if (bodyField) {
      const content = bodyField.textContent;
      const lastHashIndex = content.lastIndexOf('#');
      if (lastHashIndex !== -1) {
        const newContent = content.slice(0, lastHashIndex) + selectedTemplate.content;
        bodyField.textContent = newContent;
      } else {
        bodyField.textContent += selectedTemplate.content;
      }
      templatePopup.style.display = 'none';
    } else {
      showNotification('Error: Could not find the email body field.', true);
    }
  }

// Setup drag and drop functionality
function setupDragAndDrop() {
  const dropZone = document.body;

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload({ target: { files: [files[0]] } });
    }
  });
}

// Show notification
function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.right = '10px';
  notification.style.padding = '10px';
  notification.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Listen for template updates from the edit window
window.addEventListener('message', (event) => {
  if (event.data.type === 'templatesUpdated') {
    templates = event.data.templates;
    localStorage.setItem('emailTemplates', JSON.stringify(templates));
    showNotification('Templates updated successfully');
    updateTemplatePopup(); // Add this function to refresh the template popup
  }
});

// Initialize the extension when the page loads
window.addEventListener('load', initializeExtension);

// Edit templates
function editTemplates() {
  const editWindow = window.open(chrome.runtime.getURL('template-editor.html'), 'Edit Templates', 'width=600,height=400');
}

// Add this function to refresh the template popup
function updateTemplatePopup() {
  const templateList = document.getElementById('templateList');
  templateList.innerHTML = '';
  templates.forEach((template, index) => {
    const templateButton = document.createElement('button');
    templateButton.textContent = template.name;
    templateButton.addEventListener('click', () => loadTemplate(index));
    templateList.appendChild(templateButton);
  });
}

// Create and inject the custom send button
function createCustomSendButton() {
  const sendButtonObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        const originalSendButton = document.querySelector('div[data-tooltip="Send ‪(Ctrl-Enter)‬"]');
        if (originalSendButton && !document.getElementById('superEmailSendButton')) {
          const customSendButton = document.createElement('div');
          customSendButton.id = 'superEmailSendButton';
          customSendButton.className = 'superEmailCustomButton';
          customSendButton.textContent = 'Super Send';
          customSendButton.setAttribute('role', 'button');
          customSendButton.setAttribute('data-tooltip', 'Send with SuperEmail');
          customSendButton.addEventListener('click', handleCustomSend);

          originalSendButton.parentNode.insertBefore(customSendButton, originalSendButton.nextSibling);
          sendButtonObserver.disconnect();
          break;
        }
      }
    }
  });
  
  sendButtonObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Handle custom send button click
function handleCustomSend() {
  // You can add custom functionality here if needed
  console.log('Custom send button clicked');
  // For now, we'll just trigger the original send button
  const originalSendButton = document.querySelector('div[data-tooltip="Send ‪(Ctrl-Enter)‬"]');
  if (originalSendButton) {
    originalSendButton.click();
  } else {
    console.error('Original send button not found');
  }
}