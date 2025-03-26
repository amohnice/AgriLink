import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchConversations, fetchMessages, sendMessage, createConversation } from '../api/api';
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

  // Handle seller parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sellerId = params.get('seller');

    if (sellerId && user) {
      const initializeConversation = async () => {
        try {
          // Create or get existing conversation
          const conversation = await createConversation(sellerId);
          
          // Add conversation to list if not exists
          setConversations(prev => {
            if (!prev.find(conv => conv.id === conversation.id)) {
              return [conversation, ...prev];
            }
            return prev;
          });
          
          // Select the conversation
          setSelectedConversation(conversation);
          
          // Remove the seller parameter from URL
          navigate('/chat', { replace: true });
        } catch (err) {
          setError('Failed to start conversation with seller');
        }
      };

      initializeConversation();
    }
  }, [location.search, user, navigate]);

  // Fetch conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await fetchConversations();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const loadMessages = async () => {
        try {
          const data = await fetchMessages(selectedConversation.id);
          setMessages(data);
        } catch (err) {
          setError('Failed to load messages');
        }
      };

      loadMessages();
      socket.joinConversation(selectedConversation.id);

      return () => {
        socket.leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation, socket]);

  // Handle real-time message updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      if (selectedConversation?.id === conversationId) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversation list
      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(conv => conv.id === conversationId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: message.text,
            timestamp: message.createdAt,
            unread: selectedConversation?.id !== conversationId 
              ? (updated[index].unread || 0) + 1 
              : 0
          };
        }
        return updated;
      });
    };

    const handleTyping = ({ userId }) => {
      if (selectedConversation?.participant.id === userId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ userId }) => {
      if (selectedConversation?.participant.id === userId) {
        setIsTyping(false);
      }
    };

    socket.on('message received', handleNewMessage);
    socket.on('user typing', handleTyping);
    socket.on('user stop typing', handleStopTyping);

    return () => {
      socket.off('message received', handleNewMessage);
      socket.off('user typing', handleTyping);
      socket.off('user stop typing', handleStopTyping);
    };
  }, [socket, selectedConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);

    // Handle typing indicator
    if (selectedConversation) {
      if (typingTimeout) clearTimeout(typingTimeout);

      socket.startTyping(selectedConversation.id);
      
      const timeout = setTimeout(() => {
        socket.stopTyping(selectedConversation.id);
      }, 3000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await sendMessage(selectedConversation.id, newMessage);
      socket.sendMessage(selectedConversation.id, message);
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Update conversation in the list
      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(conv => conv.id === selectedConversation.id);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: newMessage,
            timestamp: new Date().toISOString()
          };
        }
        return updated;
      });
    } catch (err) {
      setError('Failed to send message');
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
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`${styles.conversationItem} ${
                selectedConversation?.id === conversation.id ? styles.active : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className={styles.conversationInfo}>
                <h3>{conversation.participant.name}</h3>
                <p>{conversation.lastMessage}</p>
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
              <h2>{selectedConversation.participant.name}</h2>
              <span className={styles.participantRole}>
                {selectedConversation.participant.role}
              </span>
            </div>

            <div className={styles.messageList}>
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`${styles.message} ${
                    message.sender === user.id ? styles.sent : styles.received
                  }`}
                >
                  <div className={styles.messageContent}>
                    <p>{message.text}</p>
                    <span className={styles.timestamp}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.message} ${styles.received}`}>
                  <div className={`${styles.messageContent} ${styles.typing}`}>
                    <span>typing...</span>
                  </div>
                </div>
              )}
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
              <button
                type="submit"
                disabled={!newMessage.trim()}
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
