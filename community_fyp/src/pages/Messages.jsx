import React, { useState } from 'react';
import '../styles/Messages.css';
import Layout from '../components/Layout';

const Messages = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey, I can help with your request!', sent: false },
    { id: 2, text: 'Thank you! When will you be available?', sent: true }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: newMessage, sent: true }]);
      setNewMessage('');
    }
  };

  return (
    <Layout>
      <div className="chat-container">
        <div className="chat-sidebar">
          <h2 className="page-title" style={{ color: 'white', marginBottom: '1rem' }}>Messages</h2>
          <div className="chat-item">
            <h3 className="chat-name">John Doe</h3>
            <p className="chat-preview">Hey, I can help with your request!</p>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <h2>John Doe</h2>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sent ? 'message-sent' : 'message-received'}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              className="form-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
            />
            <button className="btn btn-primary" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;