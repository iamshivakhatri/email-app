function handleCSVUpload(event) {
    console.log("CSV file selected.");
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected.");
        return;
    }
    console.log("File selected: ", file.name);
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (sheetData.length > 0) {
            console.log("Name, Email:");
            let emails = [];
            sheetData.slice(1).forEach((row) => {
                const name = row[0];
                const email = row[1];
                // Only add the email if it's valid
                if (email && email.trim() !== '') {
                    console.log(`Name: ${name}, Email: ${email}`);
                    emails.push(email);
                }
            });

            const emailString = emails.join(', ');
            // emails = emails.filter(email => email !== undefined && email !== null && email.trim() !== '');
            console.log("Emails before sending to populateToField: ", emails);

            populateToField(emails);
            event.target.value = ""; // Reset input value
        } else {
            console.log("No data found in the sheet.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function populateToField(emails) {
    const selectors = [
        'input[aria-label="To"]',
        'input[aria-label="To recipients"]',
        'input[peoplekit-id]'
    ];

    let toField;
    for (let selector of selectors) {
        console.log("Trying selector:", selector);
        toField = document.querySelector(selector);
        if (toField) {
            console.log("To field found:", toField);
            break;
        }
    }

    if (!toField) {
        console.log("Could not find the 'To' field.");
        return;
    }

    function addEmail(email, index) {
        setTimeout(() => {
            // Focus on the input field
            toField.focus();
            
            // Append the new email along with a comma and space
            let currentValue = toField.value.trim();
            if (currentValue.length > 0) {
                currentValue += ', ';  // Add a comma and space to separate emails
            }
            toField.value = currentValue + email; // Update the value of the input
            
            // Dispatch the input event to notify Gmail of the change
            toField.dispatchEvent(new Event('input', { bubbles: true }));

            // Simulate pressing Enter to finalize the email as a chip
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            toField.dispatchEvent(enterEvent);
            toField.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));
            toField.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));

            console.log("Added email:", email);
        }, index * 500);  // Slight delay to simulate typing
    }

    // Add each email with a slight delay to simulate typing and let Gmail process them
    emails.forEach((email, index) => {
        addEmail(email, index);
    });

    console.log("Attempted to add emails:", emails);
}


// function populateToField(emailString) {
//     // Try multiple selectors to find the "To" field
//     const selectors = [
//         'textarea[name="to"]',
//         'input[name="to"]',
//         'div[name="to"]',
//         'div[role="combobox"]',
//         'input[aria-label="To"]',
//         'div[aria-label="To"]'
//     ];

//     for (let selector of selectors) {
//         const toField = document.querySelector(selector);
//         if (toField) {
//             console.log("To field found:", toField);
//             console.log("selector ", selector)
//             // If it's an input or textarea, set the value directly
//             if (toField.tagName === 'INPUT' || toField.tagName === 'TEXTAREA') {
//                 toField.value = emailString;
//             } else {
//                 // If it's a div, we need to trigger an input event
//                 toField.textContent = emailString;
//                 const event = new Event('input', { bubbles: true });
//                 toField.dispatchEvent(event);
//             }
//             console.log("Emails populated in the 'To' field:", emailString);
//             return;
//         }
//     }

//     console.log("Could not find the 'To' field. Trying alternative method...");
    
//     // If we still can't find the field, try to focus it and then set the value
//     const composeWindow = document.querySelector('.aWA');
//     if (composeWindow) {
//         composeWindow.click();
//         setTimeout(() => {
//             document.execCommand('insertText', false, emailString);
//             console.log("Attempted to insert emails using execCommand");
//         }, 100);
//     } else {
//         console.log("Could not find the compose window.");
//     }
// }



// Define openTemplateSidebar before it's used
function openTemplateSidebar() {
    console.log("Template button clicked.");
}


function injectUI() {
    console.log("Attempting to inject UI");

    // Select the toolbar that contains the Send button in the Gmail compose box
    const toolbar = document.querySelector('.btC .gU.Up'); // The container with send options
    if (toolbar) {
        console.log("Toolbar found.");

        // Check if the upload button is already added to avoid duplicates
        if (!document.querySelector('.super-email-upload-btn')) {
            console.log("Injecting Upload and Template buttons next to Send button.");

            // Create file input for uploading Google Sheets or CSV
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv, .xlsx';
            fileInput.className = 'super-email-upload-btn';
            fileInput.style.marginLeft = '10px';
            fileInput.style.display = 'none'; // Hidden, we trigger it with the button below

            // Create the upload button
            const uploadButton = document.createElement('button');
            uploadButton.textContent = 'Upload CSV';
            uploadButton.className = 'super-email-upload-btn';
            uploadButton.style.marginLeft = '10px';
            uploadButton.onclick = () => fileInput.click(); // Trigger file input click

            // Append the file input and upload button to the toolbar
            toolbar.appendChild(fileInput);
            toolbar.appendChild(uploadButton);

            // Handle file selection and processing
            fileInput.onchange = handleCSVUpload;
            
        }
    } else {
        console.log("Toolbar not found yet. Retrying...");
    }
}


// Observe Gmail DOM changes and inject UI when appropriate
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('nH')) { // 'nH' is a class in Gmail's compose box
                    injectUI(); // Inject UI when compose box is added
                }
            });
        }
    });
});

// Start observing the Gmail DOM
observer.observe(document.body, { childList: true, subtree: true });

console.log("Content script loaded and MutationObserver is now watching the DOM.");
