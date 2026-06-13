import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import router from './router/router';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { AlertesProvider } from './context/AlertesContext';

export default function App() {
  return (
    
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AlertesProvider>
            <RouterProvider router={router} />
          </AlertesProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}