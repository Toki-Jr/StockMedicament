import { createContext, useContext } from 'react';
import { useAlertes } from '../hooks/useAlertes';

const AlertesContext = createContext(null);

export function AlertesProvider({ children }) {
  const value = useAlertes();
  return <AlertesContext.Provider value={value}>{children}</AlertesContext.Provider>;
}

export const useAlertesContext = () => useContext(AlertesContext);