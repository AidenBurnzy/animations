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
    
    // Show typing indicator
    showTypingIndicator();

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
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response with delay for natural feel
        setTimeout(() => {
            addMessage(data.message, 'bot');
        }, 300);

    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        
        setTimeout(() => {
            addMessage('Sorry, I\'m having trouble connecting right now. Please try again or email us at founder.auctusventures@gmail.com', 'bot');
        }, 300);
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

// ===== TYPING INDICATOR FUNCTIONS =====
function showTypingIndicator() {
    typingIndicator.classList.add('active');
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.classList.remove('active');
    typingIndicator.style.display = 'none';
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
    
    // Process the message text to make links clickable
    content.innerHTML = processMessageText(text);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    // Insert before typing indicator
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add click handlers to any links in the message
    addLinkHandlers(content);
}

// ===== PROCESS MESSAGE TEXT TO DETECT AND CREATE LINKS =====
function processMessageText(text) {
    // Escape HTML to prevent XSS
    let processed = escapeHtml(text);
    
    // Convert markdown-style links [text](url) to HTML links
    processed = processed.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="chat-link">$1</a>');
    
    // Convert bare URLs to clickable links
    processed = processed.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" class="chat-link" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Convert internal page references (e.g., "websites page", "AI page", "about page")
    processed = processed.replace(/\b(websites?|ai|about|auctus|contact)\s+(page|section)\b/gi, (match, page) => {
        const pageMap = {
            'website': 'websites.html',
            'websites': 'websites.html',
            'ai': 'ai.html',
            'about': 'auctus.html',
            'auctus': 'auctus.html',
            'contact': 'contact.html'
        };
        const url = pageMap[page.toLowerCase()] || 'index.html';
        return `<a href="${url}" class="chat-link">${match}</a>`;
    });
    
    // Convert section references (e.g., "#pricing", "pricing section")
    processed = processed.replace(/\b(pricing|services|testimonials|contact|faq)\s+section\b/gi, (match, section) => {
        if (section.toLowerCase() === 'contact') {
            return `<a href="contact.html" class="chat-link">${match}</a>`;
        }
        return `<a href="#${section.toLowerCase()}" class="chat-link scroll-link">${match}</a>`;
    });
    
    // Convert line breaks to <br>
    processed = processed.replace(/\n/g, '<br>');
    
    return processed;
}

// ===== ESCAPE HTML TO PREVENT XSS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ADD CLICK HANDLERS TO LINKS =====
function addLinkHandlers(contentElement) {
    const links = contentElement.querySelectorAll('.chat-link');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Handle internal scroll links (anchors)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId) || 
                                     document.querySelector(`[id="${targetId}"]`) ||
                                     document.querySelector(`section.${targetId}-section`);
                
                if (targetElement) {
                    // Close chat before scrolling
                    chatWindow.classList.remove('active');
                    chatButton.style.display = 'flex';
                    
                    // Smooth scroll to target
                    setTimeout(() => {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 300);
                }
            }
            // Handle same-page links with anchors (e.g., "auctus.html#pricing")
            else if (href.includes('#')) {
                const [page, anchor] = href.split('#');
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                
                // If it's the same page, just scroll
                if (page === currentPage || page === '') {
                    e.preventDefault();
                    const targetElement = document.getElementById(anchor);
                    
                    if (targetElement) {
                        chatWindow.classList.remove('active');
                        chatButton.style.display = 'flex';
                        
                        setTimeout(() => {
                            targetElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 300);
                    }
                }
                // Otherwise, let it navigate normally
            }
            // For external links, ensure they open in new tab
            else if (href.startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    });
}

// ===== HANDLE COMMON QUERIES WITH AUTO-RESPONSES =====
function getAutoResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Pricing queries
    if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return 'You can view our pricing on the [pricing section](auctus.html#pricing). We offer packages for both websites and AI solutions starting from $99/month.';
    }
    
    // Services queries
    if (lowerMessage.includes('services') || lowerMessage.includes('what do you do')) {
        return 'We specialize in two main areas:\n\n1. [Website Development](websites.html) - Custom websites, apps, and digital experiences\n2. [AI Solutions](ai.html) - Chatbots, automation, and AI-powered tools\n\nVisit each page to learn more!';
    }
    
    // Contact queries
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
    return 'You can reach us at founder.auctusventures@gmail.com or explore our [contact page](contact.html) to send us a message directly!';
    }
    
    // Getting started
    if (lowerMessage.includes('get started') || lowerMessage.includes('begin') || lowerMessage.includes('start')) {
    return 'Great! The best way to get started is to [contact us](contact.html) with details about your project. We\'ll set up a consultation to discuss your needs and create a custom solution.';
    }
    
    return null; // No auto-response, will use webhook
}

// ===== ENHANCED SEND MESSAGE WITH AUTO-RESPONSES =====
const originalSendMessage = sendMessage;
sendMessage = async function(message) {
    // Check for auto-response first
    const autoResponse = getAutoResponse(message);
    
    if (autoResponse) {
        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate delay for natural feel
        setTimeout(() => {
            hideTypingIndicator();
            addMessage(autoResponse, 'bot');
        }, 800);
        
        return;
    }
    
    // Otherwise use webhook
    return originalSendMessage(message);
};

// ===== INITIALIZE =====
console.log('Auctus AI Chat Widget initialized');