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
            const emails = [];
            sheetData.slice(1).forEach((row) => {
                const name = row[0];
                const email = row[1];
                console.log(`Name: ${name}, Email: ${email}`);
                emails.push(email);
            });
            const emailString = emails.join(', ');
            // populateToField(emailString);
            event.target.value = ""; // Reset input value
        } else {
            console.log("No data found in the sheet.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function populateToField(emailString) {
    // Try multiple selectors to find the "To" field
    const selectors = [
        'textarea[name="to"]',
        'input[name="to"]',
        'div[name="to"]',
        'div[role="combobox"]',
        'input[aria-label="To"]',
        'div[aria-label="To"]'
    ];

    for (let selector of selectors) {
        const toField = document.querySelector(selector);
        if (toField) {
            // If it's an input or textarea, set the value directly
            if (toField.tagName === 'INPUT' || toField.tagName === 'TEXTAREA') {
                toField.value = emailString;
            } else {
                // If it's a div, we need to trigger an input event
                toField.textContent = emailString;
                const event = new Event('input', { bubbles: true });
                toField.dispatchEvent(event);
            }
            console.log("Emails populated in the 'To' field:", emailString);
            return;
        }
    }

    console.log("Could not find the 'To' field. Trying alternative method...");
    
    // If we still can't find the field, try to focus it and then set the value
    const composeWindow = document.querySelector('.aWA');
    if (composeWindow) {
        composeWindow.click();
        setTimeout(() => {
            document.execCommand('insertText', false, emailString);
            console.log("Attempted to insert emails using execCommand");
        }, 100);
    } else {
        console.log("Could not find the compose window.");
    }
}



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
