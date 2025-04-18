import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import '../styles/Messages.css';
import Layout from '../components/Layout';

const socket = io('http://localhost:5000');

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const loggedInUserId = 'currentUserId'; // Replace with actual logged-in user ID

  useEffect(() => {
    socket.on('newMessage', (message) => {
      if (
        (message.senderId === loggedInUserId && message.receiverId === selectedUser?._id) ||
        (message.senderId === selectedUser?._id && message.receiverId === loggedInUserId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.disconnect();
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched users:', data);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        alert(error.message || 'Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        const response = await fetch(
          `http://localhost:5000/api/messages/${loggedInUserId}/${selectedUser._id}`
        );
        const data = await response.json();
        setMessages(data);
      };

      fetchMessages();
    }
  }, [selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      const message = {
        senderId: loggedInUserId,
        receiverId: selectedUser._id,
        text: newMessage
      };
      setMessages([...messages, message]);
      socket.emit('sendMessage', message);
      setNewMessage('');
    }
  };

  return (
    <Layout>
      <div className="chat-container">
        <div className="chat-sidebar">
          <h2 className="page-title" style={{ color: 'white', marginBottom: '1rem' }}>Messages</h2>
          {users.map((user) => (
            <div
              key={user._id}
              className={`chat-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <h3 className="chat-name">{user.name}</h3>
              <p className="chat-preview">Start a conversation</p>
            </div>
          ))}
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <h2>{selectedUser ? selectedUser.name : 'Select a user to chat'}</h2>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`message ${message.senderId === loggedInUserId ? 'message-sent' : 'message-received'}`}
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