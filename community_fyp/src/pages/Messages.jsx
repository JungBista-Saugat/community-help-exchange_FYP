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
  const [loggedInUserId, setLoggedInUserId] = useState(null); // Fetch the actual user ID

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (!data._id) {
          throw new Error('Invalid user data received');
        }

        setLoggedInUserId(data._id);
        socket.emit('identify', data._id);
      } catch (error) {
        console.error('Error fetching logged-in user:', error);
        alert(error.message || 'Failed to fetch logged-in user');
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    if (selectedUser && loggedInUserId) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `http://localhost:5000/api/messages/conversation/${loggedInUserId}/${selectedUser._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
          alert(error.message || 'Failed to fetch messages');
        }
      };

      fetchMessages();
      
      // Reset messages when changing users
      return () => {
        setMessages([]);
      };
    }
  }, [selectedUser, loggedInUserId]);

  useEffect(() => {
    // Clear existing listeners
    socket.off('newMessage');

    socket.on('newMessage', (message) => {
      // Only add message if it's part of the current conversation
      if (selectedUser && (
        (message.senderId === loggedInUserId && message.receiverId === selectedUser._id) ||
        (message.receiverId === loggedInUserId && message.senderId === selectedUser._id)
      )) {
        setMessages(prevMessages => {
          // Check if message already exists
          const messageExists = prevMessages.some(m => 
            m._id === message._id || 
            (m.text === message.text && 
             m.senderId === message.senderId && 
             m.receiverId === message.receiverId &&
             m.createdAt === message.createdAt)
          );
          
          if (!messageExists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [selectedUser, loggedInUserId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Filter out admins and the current user
        const filteredUsers = data.filter(user => 
          user.role === 'user' && user._id !== loggedInUserId
        );
        console.log('Fetched users:', filteredUsers);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        alert(error.message || 'Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !loggedInUserId) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const message = {
        senderId: loggedInUserId,
        receiverId: selectedUser._id,
        text: newMessage.trim(),
      };

      console.log('Sending message:', message); // Debug log

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to send message');
      }

      // Update local state with the saved message
      setMessages(prev => [...prev, responseData]);
      
      // Emit the saved message through socket
      socket.emit('sendMessage', responseData);
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message');
    }
  };

  return (
    <Layout>
      <div className="chat-container">
        <div className="chat-sidebar">
          <h2 className="page-title" style={{ color: 'white', marginBottom: '1rem' }}>Messages</h2>
          {users.map((user) => (
            <div
              key={user._id} // Use the user's unique _id as the key
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
                key={message._id || `${message.senderId}-${message.text}-${Date.now()}`}
                className={`message ${message.senderId === loggedInUserId ? 'message-sent' : 'message-received'}`}
              >
                <div className="message-content">
                  <p className="message-text">{message.text}</p>
                  {message.createdAt && (
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
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
              disabled={!selectedUser} // Disable input if no user is selected
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSendMessage}
              disabled={!selectedUser || !newMessage.trim()} // Disable button if no user selected or empty message
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;