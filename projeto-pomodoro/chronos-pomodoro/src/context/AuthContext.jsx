import { createContext, useContext, useEffect, useReducer } from 'react';

import { api } from '../services/api';
import { authReducer } from './authReducer';

const AuthContext = createContext({});

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

export function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await api.me();
        dispatch({ type: 'LOGIN', payload: data.user });
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
      }
    }

    loadUser();
  }, []);

  async function login(username, password) {
    const data = await api.login({ username, password });
    dispatch({ type: 'LOGIN', payload: data.user });
    return data;
  }

  async function register(name, email, username, password) {
    return api.register({ name, email, username, password });
  }

  async function logout() {
    await api.logout();
    dispatch({ type: 'LOGOUT' });
  }

  async function forgotPassword(email) {
    return api.forgotPassword({ email });
  }

  async function resetPassword(token, password) {
    return api.resetPassword({ token, password });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        user: state.user,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
