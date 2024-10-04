let templates = [];

function initializeTemplateEditor() {
  // Retrieve templates from localStorage or use default templates
  templates = JSON.parse(localStorage.getItem('emailTemplates')) || [
    { name: 'Marketing Email', content: 'Hello [Firstname],\n\nWe have an exciting offer for you...' },
    { name: 'Follow-Up Email', content: 'Hi [Firstname],\n\nI hope this email finds you well. I wanted to follow up on...' },
    { name: 'Reminder Email', content: 'Dear [Firstname],\n\nThis is a friendly reminder about...' },
    { name: 'Welcome Email', content: 'Welcome, [Firstname]!\n\nWe\'re thrilled to have you on board...' },
    { name: 'Thank You Email', content: 'Dear [Firstname],\n\nThank you for your recent...' }
  ];

  const templateForms = document.getElementById('templateForms');
  templates.forEach((template, index) => {
    const form = document.createElement('div');
    form.innerHTML = `
      <h3>${template.name}</h3>
      <textarea id="template${index}">${template.content}</textarea>
    `;
    templateForms.appendChild(form);
  });

  document.getElementById('saveTemplates').addEventListener('click', saveTemplates);
}

function saveTemplates() {
  const updatedTemplates = templates.map((template, index) => ({
    ...template,
    content: document.getElementById(`template${index}`).value
  }));
  localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
  window.opener.postMessage({ type: 'templatesUpdated', templates: updatedTemplates }, '*');
  window.close();
}

document.addEventListener('DOMContentLoaded', initializeTemplateEditor);