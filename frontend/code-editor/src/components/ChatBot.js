import React, { useState } from 'react';
import '../css/ChatBot.css';

const ChatBot = ({handleAskAI}) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            return;
        }
    
        // Check if the message starts with '/'
        if (newMessage.startsWith('/')) {
            // A command
        } else {
            // Normal message sending
            setMessages(messages => [...messages, { id: Date.now(), text: newMessage }]);
        }
        try {
            // Assuming handleAskAI returns a promise, await its result
            const aiResponse = await handleAskAI(newMessage);
            setMessages(messages => [...messages, { id: Date.now(), text: `AI Response: ${aiResponse}` }]);
        } catch (error) {
            setMessages(messages => [...messages, { id: Date.now(), text: 'Failed to communicate with AI.' }]);
        }
        setNewMessage('');
    };

    const handleInputChange = (event) => {
        setNewMessage(event.target.value);
    };

    return (
        <div className="chat-bot-container">
            <div className="message-window">
                {messages.map(msg => (
                    <div key={msg.id} className="message">{msg.text}</div>
                ))}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={(event) => event.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatBot;
