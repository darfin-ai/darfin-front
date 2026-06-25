import { createContext, useContext, useState } from "react";
const AuthContext = createContext({
  isLoggedIn: false,
  login: () => {
  },
  logout: () => {
  }
});
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("darfin_logged_in") === "true"
  );
  const login = () => {
    localStorage.setItem("darfin_logged_in", "true");
    setIsLoggedIn(true);
  };
  const logout = () => {
    localStorage.removeItem("darfin_logged_in");
    setIsLoggedIn(false);
  };
  return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  return useContext(AuthContext);
}
