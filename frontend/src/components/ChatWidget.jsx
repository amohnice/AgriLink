import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import styles from "../styles/ChatWidget.module.css";

function ChatWidget({ recipientId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !recipientId) return;

    // Join the chat room
    socket.joinConversation(recipientId);

    // Handle incoming messages
    const handleNewMessage = ({ message }) => {
      setMessages(prev => [...prev, message]);
    };

    // Handle typing indicators
    const handleTyping = ({ userId }) => {
      if (userId === recipientId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ userId }) => {
      if (userId === recipientId) {
        setIsTyping(false);
      }
    };

    socket.on('message received', handleNewMessage);
    socket.on('user typing', handleTyping);
    socket.on('user stop typing', handleStopTyping);

    return () => {
      socket.leaveConversation(recipientId);
      socket.off('message received', handleNewMessage);
      socket.off('user typing', handleTyping);
      socket.off('user stop typing', handleStopTyping);
    };
  }, [socket, recipientId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      to: recipientId,
      message: newMessage.trim(),
    };

    socket.sendMessage(recipientId, messageData);
    setNewMessage("");
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3>Chat</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
      
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.from === user?.id ? styles.sent : styles.received
            }`}
          >
            <p>{msg.message}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
        {isTyping && (
          <div className={styles.typing}>User is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWidget; 