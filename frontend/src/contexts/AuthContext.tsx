/** React Context providing global authentication state to component sub-trees. */

import { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import type { User } from '../types/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
