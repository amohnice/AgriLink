import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, sendMessage } from '../api/api';
import styles from '../styles/Chat.module.css';

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await api.get('/chat/conversations');
        console.log('Loaded conversations:', response.data); // Debug log
        
        // Ensure each conversation has required fields and normalize the ID field
        const validConversations = response.data.filter(conv => {
          if (!conv || (!conv._id && !conv.id)) {
            console.error('Invalid conversation:', conv);
            return false;
          }
          return true;
        }).map(conv => ({
          ...conv,
          _id: conv._id || conv.id // Normalize to _id
        }));
        
        console.log('Valid conversations:', validConversations);
        setConversations(validConversations);
        
        // If we have conversations but none selected, select the first one
        if (validConversations.length > 0 && (!selectedConversation || !selectedConversation._id)) {
          console.log('Selecting first conversation:', validConversations[0]);
          setSelectedConversation(validConversations[0]);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError(err.response?.data?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  // Handle seller parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sellerId = params.get('seller');

    if (sellerId && user) {
      const initializeConversation = async () => {
        try {
          // Create or get existing conversation
          const response = await api.post('/chat/conversations', { participantId: sellerId });
          const conversation = response.data;
          
          console.log('Created/Found conversation:', conversation);
          
          if (!conversation || (!conversation._id && !conversation.id)) {
            throw new Error('Invalid conversation data received');
          }
          
          // Normalize the conversation object
          const normalizedConversation = {
            ...conversation,
            _id: conversation._id || conversation.id
          };
          
          // Add conversation to list if not exists
          setConversations(prev => {
            if (!prev.find(conv => conv._id === normalizedConversation._id)) {
              return [normalizedConversation, ...prev];
            }
            return prev;
          });
          
          // Select the conversation
          setSelectedConversation(normalizedConversation);
          
          // Remove the seller parameter from URL
          navigate('/chat', { replace: true });
        } catch (err) {
          console.error('Error initializing conversation:', err);
          setError(err.response?.data?.message || 'Failed to start conversation with seller');
        }
      };

      initializeConversation();
    }
  }, [location.search, user, navigate]);

  // Load messages for selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;

      try {
        const response = await api.get(`/chat/conversations/${selectedConversation._id}/messages`);
        console.log('Loaded messages:', response.data); // Debug log
        setMessages(response.data);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(err.response?.data?.message || 'Failed to load messages');
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Handle real-time message updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversation list
      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(conv => conv._id === conversationId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: message.text || 'Sent an image',
            timestamp: message.createdAt,
            unread: selectedConversation?._id !== conversationId 
              ? (updated[index].unread || 0) + 1 
              : 0
          };
        }
        return updated;
      });
    };

    socket.on('message received', handleNewMessage);

    return () => {
      socket.off('message received', handleNewMessage);
    };
  }, [socket, selectedConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validate conversation exists and has an ID
    if (!selectedConversation || !selectedConversation._id) {
      console.error('No valid conversation selected:', selectedConversation);
      setError('Please select a conversation first');
      return;
    }

    // Validate message content
    if (!newMessage.trim() && !selectedImage) {
      console.error('No message content');
      return;
    }

    try {
      let messageData;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        if (newMessage.trim()) {
          formData.append('text', newMessage.trim());
        }
        messageData = formData;
      } else {
        messageData = newMessage.trim();
      }

      console.log('Sending message to conversation:', {
        conversationId: selectedConversation._id,
        messageData: messageData instanceof FormData ? 'FormData object' : messageData
      });

      const response = await sendMessage(selectedConversation._id, messageData);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const message = response.data;
      console.log('Message sent successfully:', message);
      
      // Update messages immediately
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setSelectedImage(null);

      // Reset file input
      if (e.target.querySelector('input[type="file"]')) {
        e.target.querySelector('input[type="file"]').value = '';
      }

      // Update conversation in the list
      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(conv => conv._id === selectedConversation._id);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: message.text || 'Sent an image',
            timestamp: new Date().toISOString()
          };
        }
        return updated;
      });
    } catch (err) {
      console.error('Error sending message:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        conversationId: selectedConversation._id,
        selectedConversation
      });
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Messages</h2>
        </div>
        <div className={styles.conversationList}>
          {Array.isArray(conversations) && conversations.map((conversation, index) => (
            <div
              key={conversation._id || `conv-${index}`}
              className={`${styles.conversationItem} ${
                selectedConversation?._id === conversation._id ? styles.active : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className={styles.conversationInfo}>
                <h3>{conversation.participant?.name || 'Unknown User'}</h3>
                <p>{conversation.lastMessage || 'No messages yet'}</p>
              </div>
              {conversation.unread > 0 && (
                <span className={styles.unreadBadge}>{conversation.unread}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <h2>{selectedConversation.participant?.name || 'Unknown User'}</h2>
              <span className={styles.participantRole}>
                {selectedConversation.participant?.role || 'User'}
              </span>
            </div>

            <div className={styles.messageList}>
              {Array.isArray(messages) && messages.map((message, index) => {
                const isSent = message.sender?._id === user?._id;
                return (
                  <div
                    key={message._id || `msg-${index}`}
                    className={`${styles.message} ${isSent ? styles.sent : styles.received}`}
                  >
                    <div className={styles.messageContent}>
                      {message.text && <p>{message.text}</p>}
                      {message.image && (
                        <div className={styles.imageContainer}>
                          <img 
                            src={message.image.url} 
                            alt="Message attachment" 
                            className={styles.messageImage}
                            onClick={() => window.open(message.image.url, '_blank')}
                          />
                        </div>
                      )}
                      <span className={styles.timestamp}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.messageForm}>
              <input
                type="text"
                value={newMessage}
                onChange={handleMessageChange}
                placeholder="Type a message..."
                className={styles.messageInput}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className={styles.imageInput}
                id="imageInput"
              />
              <label htmlFor="imageInput" className={styles.imageButton}>
                📎
              </label>
              <button
                type="submit"
                disabled={!newMessage.trim() && !selectedImage}
                className={styles.sendButton}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className={styles.noConversation}>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;