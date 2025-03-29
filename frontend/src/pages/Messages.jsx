import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../api/api';
import styles from '../styles/Messages.module.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchMessages();

    // Set up socket listeners for real-time updates
    if (socket) {
      socket.on('newMessage', (message) => {
        setMessages(prev => [message, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
      }
    };
  }, [socket]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages');
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMessage) return;

    try {
      const response = await api.post('/messages', {
        recipientId: selectedMessage.sender._id,
        content: newMessage
      });
      setMessages(prev => [response.data, ...prev]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError(err.response?.data?.message || 'Failed to mark message as read');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.messagesList}>
        {messages.map(message => (
          <div
            key={message._id}
            className={`${styles.messageItem} ${!message.read ? styles.unread : ''} ${
              selectedMessage?._id === message._id ? styles.selected : ''
            }`}
            onClick={() => {
              setSelectedMessage(message);
              if (!message.read) {
                handleMarkAsRead(message._id);
              }
            }}
          >
            <div className={styles.messageHeader}>
              <span className={styles.sender}>
                {message.sender._id === user._id ? 'You' : message.sender.name}
              </span>
              <span className={styles.date}>{formatDate(message.createdAt)}</span>
            </div>
            <div className={styles.messagePreview}>
              {message.content.substring(0, 50)}
              {message.content.length > 50 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>

      {selectedMessage && (
        <div className={styles.messageDetail}>
          <div className={styles.messageHeader}>
            <h3>
              {selectedMessage.sender._id === user._id
                ? `To: ${selectedMessage.recipient.name}`
                : `From: ${selectedMessage.sender.name}`}
            </h3>
            <span className={styles.date}>
              {formatDate(selectedMessage.createdAt)}
            </span>
          </div>
          <div className={styles.messageContent}>
            {selectedMessage.content}
          </div>
          <div className={styles.messageActions}>
            <button
              className={`${styles.actionButton} ${styles.delete}`}
              onClick={() => handleDeleteMessage(selectedMessage._id)}
            >
              Delete
            </button>
          </div>
          {selectedMessage.sender._id !== user._id && (
            <div className={styles.replySection}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                className={styles.replyInput}
              />
              <button
                className={`${styles.actionButton} ${styles.send}`}
                onClick={handleSendMessage}
              >
                Send Reply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages; 