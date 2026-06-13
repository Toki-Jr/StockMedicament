import { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = useSocket();
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext doit être dans <SocketProvider>');
  return ctx;
};