import { AppRouter } from './src/router/AppRouter';
import { AuthContextProvider } from './contexts/AuthContext';

export function App() {
  return (
    <AuthContextProvider>
      <AppRouter />
    </AuthContextProvider>
  );
}
