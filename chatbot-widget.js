// ===== CONFIGURATION =====
// REPLACE THIS WITH YOUR N8N WEBHOOK URL
const WEBHOOK_URL = 'https://aidenburns.app.n8n.cloud/webhook/chatbot';

// ===== DOM ELEMENTS =====
const chatButton = document.getElementById('chat-button');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');

// ===== OPEN/CLOSE CHAT =====
chatButton.addEventListener('click', () => {
    chatWindow.classList.add('active');
    chatButton.style.display = 'none';
    chatInput.focus();
});

closeChat.addEventListener('click', () => {
    chatWindow.classList.remove('active');
    chatButton.style.display = 'flex';
});

// ===== QUICK ACTIONS =====
document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const message = btn.getAttribute('data-message');
        sendMessage(message);
    });
});

// ===== SEND MESSAGE =====
sendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        sendMessage(message);
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    }
});

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// ===== SEND MESSAGE FUNCTION =====
async function sendMessage(message) {
    // Add user message to chat
    addMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Disable input while processing
    chatInput.disabled = true;
    sendButton.disabled = true;
    typingIndicator.classList.add('active');

    try {
        // Send to n8n webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Add bot response
        typingIndicator.classList.remove('active');
        addMessage(data.message, 'bot');

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.classList.remove('active');
        addMessage('Sorry, I\'m having trouble connecting right now. Please try again or email us at hello@auctusventures.com', 'bot');
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

// ===== ADD MESSAGE TO CHAT =====
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    // Insert before typing indicator
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}