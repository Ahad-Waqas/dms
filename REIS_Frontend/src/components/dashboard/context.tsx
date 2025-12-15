import { createContext, useContext, useState } from 'react';

// Create the context
const MyContext = createContext();

// Create a provider component
export function MyContextProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    theme: 'light'
  });

  // Functions to update state
  const login = (userData) => {
    setState({
      ...state,
      user: userData,
      isAuthenticated: true
    });
  };

  const logout = () => {
    setState({
      ...state,
      user: null,
      isAuthenticated: false
    });
  };

  const toggleTheme = () => {
    setState({
      ...state,
      theme: state.theme === 'light' ? 'dark' : 'light'
    });
  };

  // Value to be provided
  const value = {
    ...state,
    login,
    logout,
    toggleTheme
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// Custom hook for using the context
export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
}