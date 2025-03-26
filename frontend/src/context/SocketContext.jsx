import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let currentSocket = null;

    const connectSocket = () => {
      if (!user || !localStorage.getItem('token')) {
        if (currentSocket) {
          currentSocket.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
        return;
      }

      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Connect to the chat namespace with the /api prefix
      currentSocket = io(`${baseURL}/api/chat`, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      currentSocket.on('connect', () => {
        console.log('Connected to chat WebSocket');
        setIsConnected(true);
      });

      currentSocket.on('disconnect', (reason) => {
        console.log('Disconnected from chat WebSocket:', reason);
        setIsConnected(false);
      });

      currentSocket.on('connect_error', (error) => {
        console.error('Chat WebSocket connection error:', error.message);
        setIsConnected(false);
        
        // If the error is authentication-related, clear the socket
        if (error.message.includes('auth')) {
          currentSocket.disconnect();
          setSocket(null);
        }
      });

      setSocket(currentSocket);
    };

    // Only try to connect if we have a user and token
    if (user && localStorage.getItem('token')) {
      connectSocket();
    }

    return () => {
      if (currentSocket) {
        currentSocket.disconnect();
        currentSocket.removeAllListeners();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user]);

  const value = {
    socket,
    isConnected,
    emit: (...args) => {
      if (!socket?.connected) {
        console.warn('Socket not connected. Cannot emit event:', args[0]);
        return;
      }
      socket.emit(...args);
    },
    on: (event, callback) => socket?.on(event, callback),
    off: (event, callback) => socket?.off(event, callback),
    joinConversation: (conversationId) => {
      if (socket?.connected) {
        socket.emit('join conversation', conversationId);
      }
    },
    leaveConversation: (conversationId) => {
      if (socket?.connected) {
        socket.emit('leave conversation', conversationId);
      }
    },
    sendMessage: (conversationId, message) => {
      if (socket?.connected) {
        socket.emit('new message', { conversationId, message });
      }
    },
    startTyping: (conversationId) => {
      if (socket?.connected) {
        socket.emit('typing', { conversationId });
      }
    },
    stopTyping: (conversationId) => {
      if (socket?.connected) {
        socket.emit('stop typing', { conversationId });
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
