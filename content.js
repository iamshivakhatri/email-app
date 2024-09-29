// // Inject UI elements
// function injectUI() {
//     const composeBox = document.querySelector('.aoD.hl');
//     if (composeBox) {
//       const uploadButton = document.createElement('button');
//       uploadButton.textContent = 'Upload CSV';
//       uploadButton.className = 'super-email-upload-btn';
//       uploadButton.onclick = handleCSVUpload;
//       composeBox.appendChild(uploadButton);
  
//       const templateButton = document.createElement('button');
//       templateButton.textContent = '#';
//       templateButton.className = 'super-email-template-btn';
//       templateButton.onclick = openTemplateSidebar;
//       composeBox.appendChild(templateButton);
//     }
//   }
  
//   function handleCSVUpload() {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.csv';
//     input.onchange = async (event) => {
//       const file = event.target.files[0];
//       const text = await file.text();
//       const emails = parseCSV(text);
//       fillRecipients(emails);
//     };
//     input.click();
//   }
  
//   function parseCSV(text) {
//     // Simple CSV parsing, you might want to use a library for more robust parsing
//     return text.split('\n').map(line => line.split(',')[0]).filter(email => email.includes('@'));
//   }
  
//   function fillRecipients(emails) {
//     const recipientField = document.querySelector('input[name="to"]');
//     if (recipientField) {
//       recipientField.value = emails.join(', ');
//     }
//   }
  
//   function openTemplateSidebar() {
//     const sidebar = document.createElement('div');
//     sidebar.className = 'super-email-sidebar';
//     sidebar.innerHTML = `
//       <h2>Email Templates</h2>
//       <ul>
//         <li><button onclick="loadTemplate('marketing')">Marketing Email</button></li>
//         <li><button onclick="loadTemplate('followup')">Follow-Up Email</button></li>
//         <li><button onclick="loadTemplate('reminder')">Reminder Email</button></li>
//         <li><button onclick="loadTemplate('welcome')">Welcome Email</button></li>
//         <li><button onclick="loadTemplate('thankyou')">Thank You Email</button></li>
//       </ul>
//       <button onclick="editTemplates()">Edit Templates</button>
//     `;
//     document.body.appendChild(sidebar);
//   }
  
//   function loadTemplate(type) {
//     // Implement template loading logic
//     console.log(`Loading ${type} template`);
//   }
  
//   function editTemplates() {
//     // Implement template editing logic
//     console.log('Editing templates');
//   }
  
//   // Initialize the extension
//   injectUI();

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    observeComposeBox();
});

// Function to observe the DOM for the Gmail compose box
function observeComposeBox() {
    const observer = new MutationObserver(function(mutations, observer) {
        // Check if compose box is loaded
        mutations.forEach(mutation => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('aYF')) {
                        injectUI();
                    }
                });
            }
        });
    });

    // Observe changes in the Gmail DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Function to inject the UI elements
function injectUI() {
    const composeBox = document.querySelector('.aoD.hl');
    if (composeBox) {
        // Check if the upload button is already added to avoid duplicates
        if (!document.querySelector('.super-email-upload-btn')) {
            const uploadButton = document.createElement('button');
            uploadButton.textContent = 'Upload CSV';
            uploadButton.className = 'super-email-upload-btn';
            uploadButton.style.marginLeft = '10px';
            uploadButton.onclick = handleCSVUpload;
            composeBox.appendChild(uploadButton);

            const templateButton = document.createElement('button');
            templateButton.textContent = '#';
            templateButton.className = 'super-email-template-btn';
            templateButton.style.marginLeft = '5px';
            templateButton.onclick = openTemplateSidebar;
            composeBox.appendChild(templateButton);
        }
    }
}

// Function to handle CSV upload (this part is your existing code)
function handleCSVUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (event) => {
        const file = event.target.files[0];
        const text = await file.text();
        const emails = parseCSV(text);
        fillRecipients(emails);
    };
    input.click();
}

// Function to parse CSV
function parseCSV(text) {
    // Simple CSV parsing, you might want to use a library for more robust parsing
    return text.split('\n').map(line => line.split(',')[0]).filter(email => email.includes('@'));
}

// Function to fill recipients
function fillRecipients(emails) {
    const recipientField = document.querySelector('textarea[name="to"]');
    if (recipientField) {
        recipientField.value = emails.join(', ');
    }
}

// Function to open the template sidebar (this part is your existing code)
function openTemplateSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'super-email-sidebar';
    sidebar.innerHTML = `
        <h2>Email Templates</h2>
        <ul>
            <li><button onclick="loadTemplate('marketing')">Marketing Email</button></li>
            <li><button onclick="loadTemplate('followup')">Follow-Up Email</button></li>
            <li><button onclick="loadTemplate('reminder')">Reminder Email</button></li>
            <li><button onclick="loadTemplate('welcome')">Welcome Email</button></li>
            <li><button onclick="loadTemplate('thankyou')">Thank You Email</button></li>
        </ul>
        <button onclick="editTemplates()">Edit Templates</button>
    `;
    document.body.appendChild(sidebar);
}

// Function to load template (stub for your existing functionality)
function loadTemplate(type) {
    console.log(`Loading ${type} template`);
}

// Function to edit templates (stub for your existing functionality)
function editTemplates() {
    console.log('Editing templates');
}
