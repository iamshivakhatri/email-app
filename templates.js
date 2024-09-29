const templates = {
    marketing: "Hello [Firstname],\n\nI am writing to you about our latest offer...",
    newsletter: "Dear [Firstname],\n\nCheck out our latest newsletter...",
    followUp: "Hi [Firstname],\n\nJust following up on our previous conversation...",
    eventInvitation: "Hello [Firstname],\n\nYou are invited to our upcoming event...",
    thankYou: "Dear [Firstname],\n\nThank you for your support..."
};

function showTemplateOptions() {
    const templateEditor = document.createElement('div');
    templateEditor.id = 'templateEditor';
    
    Object.keys(templates).forEach((key) => {
        const templateButton = document.createElement('button');
        templateButton.innerText = `${key} Template`;
        templateButton.onclick = () => selectTemplate(key);
        templateEditor.appendChild(templateButton);
    });

    const editButton = document.createElement('button');
    editButton.classList.add('edit-template');
    editButton.innerText = 'Edit Selected Template';
    editButton.onclick = editTemplate;
    templateEditor.appendChild(editButton);

    document.body.appendChild(templateEditor);
}

function selectTemplate(key) {
    const selectedTemplate = templates[key];
    const emailBody = document.querySelector('div[aria-label="Message Body"]');
    if (emailBody) {
        emailBody.innerText = selectedTemplate.replace('[Firstname]', ''); // Replace with dynamic name if needed
    }
}

function editTemplate() {
    const emailBody = document.querySelector('div[aria-label="Message Body"]');
    if (emailBody) {
        const newContent = prompt("Edit your template", emailBody.innerText);
        if (newContent) {
            emailBody.innerText = newContent;
        }
    }
}

document.addEventListener('keypress', (e) => {
    if (e.key === '#') {
        showTemplateOptions();
    }
});
