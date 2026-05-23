import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import router from './router/router';
import ThemeToggle from './components/shared/ThemeToggle';  
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}