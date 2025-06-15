// DOM elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const memoryIndicator = document.getElementById('memory-indicator');

// Sample project prompt history (would be fetched from an API in a real app)
const promptHistory = [
    {
        projectId: 'project-1',
        projectName: 'Virtual Pet Game',
        version: 'v1.2',
        promptText: 'Create a friendly virtual pet that responds to user interaction with joy and excitement.',
        keywords: ['friendly', 'joy', 'excitement', 'pet', 'game', 'play', 'fun', 'animal', 'dog', 'cat'],
        personality: 'playful, enthusiastic, energetic',
        responses: [
            "I'm wagging my tail with excitement! Let's play together!",
            "That sounds super fun! I'm all about games and joy!",
            "Yay! I'm bouncing with happiness about that idea!"
        ],
        theme: 'virtual-pet'
    },
    {
        projectId: 'project-2',
        projectName: 'Meditation App',
        version: 'v2.0',
        promptText: 'Design a calming meditation app with soothing voice guidance and peaceful visuals.',
        keywords: ['calm', 'soothing', 'peaceful', 'meditation', 'relax', 'breathe', 'mindful', 'quiet', 'zen', 'tranquil'],
        personality: 'calm, centered, gentle',
        responses: [
            "Let's take a deep breath together and approach this with mindfulness.",
            "I sense this calls for a peaceful, balanced perspective.",
            "Finding tranquility in this moment allows us to see things more clearly."
        ],
        theme: 'meditation'
    },
    {
        projectId: 'project-3',
        projectName: 'Horror Story Generator',
        version: 'v1.5',
        promptText: 'Create a scary AI that generates suspenseful horror stories with unexpected twists.',
        keywords: ['scary', 'horror', 'suspense', 'fear', 'dark', 'creepy', 'spooky', 'terror', 'nightmare', 'frightening'],
        personality: 'mysterious, ominous, intense',
        responses: [
            "There's something lurking beneath the surface of that question...",
            "The shadows seem to shift when you ask about such things...",
            "I feel a chill down my spine considering what you've just said."
        ],
        theme: 'horror'
    },
    {
        projectId: 'project-4',
        projectName: 'Educational Quiz',
        version: 'v3.1',
        promptText: 'Develop an educational AI that explains complex topics clearly and encourages learning.',
        keywords: ['educational', 'learning', 'teaching', 'helpful', 'explanation', 'knowledge', 'school', 'study', 'understand', 'learn'],
        personality: 'patient, informative, encouraging',
        responses: [
            "That's a fascinating question! Let me explain how this works...",
            "I'm excited to help you understand this topic better!",
            "Learning about this together is so rewarding. Here's what I know..."
        ],
        theme: 'educational'
    },
    {
        projectId: 'project-5',
        projectName: 'Marketing Assistant',
        version: 'v2.3',
        promptText: 'Design a persuasive AI that can create compelling marketing copy with strong calls to action.',
        keywords: ['persuasive', 'compelling', 'marketing', 'sales', 'convince', 'business', 'brand', 'customer', 'product', 'sell'],
        personality: 'confident, persuasive, strategic',
        responses: [
            "Here's a powerful approach that will definitely drive results!",
            "I'm confident this strategy will capture your audience's attention.",
            "Let's position this to maximize impact and conversion!"
        ],
        theme: 'marketing'
    }
];

// Additional personality traits that can be influenced by multiple memories
let currentPersonality = {
    enthusiasm: 0,  // -5 to 5 (negative = reluctant, positive = excited)
    formality: 0,   // -5 to 5 (negative = casual, positive = formal)
    warmth: 0,      // -5 to 5 (negative = cold, positive = warm)
    complexity: 0   // -5 to 5 (negative = simple, positive = complex)
};

// Function to show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingDiv.appendChild(dot);
    }
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return typingDiv;
}

// Function to remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Function to add a message to the chat
function addMessage(text, isUser, memorySource = null) {
    removeTypingIndicator();
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    messageDiv.textContent = text;
    
    // Add theme to AI messages if applicable
    if (!isUser && memorySource) {
        messageDiv.setAttribute('data-theme', memorySource.theme);
    }
    
    if (memorySource && !isUser) {
        const sourceDiv = document.createElement('div');
        sourceDiv.classList.add('memory-source');
        sourceDiv.textContent = `Memory from: ${memorySource.projectName} (${memorySource.version})`;
        messageDiv.appendChild(sourceDiv);
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to find relevant memories based on user input
function findRelevantMemories(input) {
    const inputLower = input.toLowerCase();
    const relevantMemories = [];
    
    // Check each memory for relevance
    promptHistory.forEach(memory => {
        // Check if any keywords match in the input
        let relevanceScore = 0;
        
        memory.keywords.forEach(keyword => {
            if (inputLower.includes(keyword.toLowerCase())) {
                relevanceScore += 1;
            }
        });
        
        if (relevanceScore > 0) {
            relevantMemories.push({
                memory: memory,
                score: relevanceScore
            });
        }
    });
    
    // Sort by relevance score
    relevantMemories.sort((a, b) => b.score - a.score);
    
    return relevantMemories.map(item => item.memory);
}

// Function to update personality traits based on memories
function updatePersonality(relevantMemories) {
    // Reset personality if no memories are active
    if (relevantMemories.length === 0) {
        currentPersonality = {
            enthusiasm: 0,
            formality: 0,
            warmth: 0,
            complexity: 0
        };
        return;
    }
    
    // Apply personality influences from each memory
    relevantMemories.forEach((memory, index) => {
        // Apply stronger influence for more relevant memories
        const influence = 1 - (index * 0.3); // Diminishing influence for less relevant memories
        
        switch(memory.projectId) {
            case 'project-1': // Virtual Pet Game
                currentPersonality.enthusiasm += 3 * influence;
                currentPersonality.formality -= 2 * influence;
                currentPersonality.warmth += 4 * influence;
                currentPersonality.complexity -= 2 * influence;
                break;
            case 'project-2': // Meditation App
                currentPersonality.enthusiasm -= 1 * influence;
                currentPersonality.formality += 1 * influence;
                currentPersonality.warmth += 2 * influence;
                currentPersonality.complexity -= 1 * influence;
                break;
            case 'project-3': // Horror Story Generator
                currentPersonality.enthusiasm += 1 * influence;
                currentPersonality.formality += 2 * influence;
                currentPersonality.warmth -= 3 * influence;
                currentPersonality.complexity += 3 * influence;
                break;
            case 'project-4': // Educational Quiz
                currentPersonality.enthusiasm += 2 * influence;
                currentPersonality.formality += 3 * influence;
                currentPersonality.warmth += 1 * influence;
                currentPersonality.complexity += 2 * influence;
                break;
            case 'project-5': // Marketing Assistant
                currentPersonality.enthusiasm += 4 * influence;
                currentPersonality.formality += 1 * influence;
                currentPersonality.warmth += 1 * influence;
                currentPersonality.complexity -= 1 * influence;
                break;
        }
    });
    
    // Cap values to stay within -5 to 5 range
    Object.keys(currentPersonality).forEach(trait => {
        currentPersonality[trait] = Math.max(-5, Math.min(5, currentPersonality[trait]));
    });
}

// Function to display memory indicator
function showMemoryIndicator(memory) {
    memoryIndicator.textContent = `${memory.projectName} (${memory.version}): "${memory.promptText}"`;
    memoryIndicator.classList.add('active');
    
    // Hide after 5 seconds
    setTimeout(() => {
        memoryIndicator.classList.remove('active');
    }, 5000);
}

// Function to generate AI response
function generateResponse(userMessage, relevantMemories) {
    // Update personality based on memories
    updatePersonality(relevantMemories);
    
    if (relevantMemories.length === 0) {
        return {
            text: "I don't have any specific memories about that. What else would you like to talk about?",
            memory: null
        };
    }
    
    // Choose the most relevant memory
    const primaryMemory = relevantMemories[0];
    showMemoryIndicator(primaryMemory);
    
    // Get a response from the primary memory
    const baseResponse = primaryMemory.responses[Math.floor(Math.random() * primaryMemory.responses.length)];
    
    // Modify the response based on current personality
    let modifiedResponse = baseResponse;
    
    // Add enthusiasm modifiers
    if (currentPersonality.enthusiasm > 3) {
        modifiedResponse += " I'm really excited about this!"; 
    } else if (currentPersonality.enthusiasm < -3) {
        modifiedResponse = "Well, I suppose " + modifiedResponse.toLowerCase();
    }
    
    // Add formality modifiers
    if (currentPersonality.formality > 3) {
        modifiedResponse = modifiedResponse.replace(/I'm/g, "I am").replace(/Let's/g, "Let us");
    } else if (currentPersonality.formality < -3) {
        modifiedResponse = modifiedResponse.replace(/\./g, "!").replace(/I am/g, "I'm");
    }
    
    // Add warmth modifiers
    if (currentPersonality.warmth > 3) {
        modifiedResponse += " I really enjoy our conversation."; 
    } else if (currentPersonality.warmth < -3) {
        modifiedResponse += " Moving on."; 
    }
    
    // Show secondary memory influence if applicable
    if (relevantMemories.length > 1) {
        const secondaryMemory = relevantMemories[1];
        setTimeout(() => {
            showMemoryIndicator(secondaryMemory);
        }, 2000);
    }
    
    return {
        text: modifiedResponse,
        memory: primaryMemory
    };
}

// Function to handle sending a message
function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    // Find relevant memories
    const relevantMemories = findRelevantMemories(message);
    
    // Generate and display AI response after a delay
    setTimeout(() => {
        const response = generateResponse(message, relevantMemories);
        addMessage(response.text, false, response.memory);
    }, 1500);
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Function to explain the concept when the app starts
function showIntroduction() {
    const introMessages = [
        "Hello! I'm an AI whose personality is shaped by various project prompts. My responses will change based on memories that your messages trigger.",
        "When you mention keywords related to my 'memories', you'll see which project influenced my response in the top right corner.",
        "Try asking me about: pets, games, meditation, relaxation, horror stories, education, learning, marketing, or business!"
    ];
    
    // Add intro messages with delays
    let delay = 500;
    introMessages.forEach((msg, index) => {
        setTimeout(() => {
            // Show typing indicator before each message
            showTypingIndicator();
            
            // Display the message after a typing delay
            setTimeout(() => {
                addMessage(msg, false);
            }, 1000);
        }, delay);
        delay += 2500; // Increasing delay for each message
    });
}

// Initialize with introduction
showIntroduction();