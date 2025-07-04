const fs = require('fs');
const path = require('path');
const FILE_PATH = path.join(__dirname, '../eventReminders.json');

// Load reminders from disk
function loadReminders() {
    if (!fs.existsSync(FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
}

// Save reminders to disk
function saveReminders(reminders) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(reminders, null, 2));
}

// Initialize reminders from disk
let eventReminders = loadReminders(); // { messageId: { ... } }

// Save reminders after any change
function updateReminder(messageId, data) {
    eventReminders[messageId] = data;
    saveReminders(eventReminders);
}

function removeReminder(messageId) {
    delete eventReminders[messageId];
    saveReminders(eventReminders);
}

module.exports = {
    eventReminders,
    updateReminder,
    removeReminder,
    loadReminders,
    saveReminders
};