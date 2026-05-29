import { createContext, useContext, useEffect, useReducer } from "react";

import { authReducer } from "./authReducer";

const AuthContext = createContext({});

const initialState = {
  isAuthenticated: false,
};

export function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("aurora-auth");

    if (storedAuth === "true") {
      dispatch({ type: "LOGIN" });
    }
  }, []);

  function login() {
    sessionStorage.setItem("aurora-auth", "true");
    dispatch({ type: "LOGIN" });
  }

  function logout() {
    sessionStorage.removeItem("aurora-auth");
    dispatch({ type: "LOGOUT" });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
