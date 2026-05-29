import { AppRouter } from "./src/router/AppRouter";
import { AuthContextProvider } from "./src/context/AuthContext";

export function App() {
  return (
    <AuthContextProvider>
      <AppRouter />
    </AuthContextProvider>
  );
}
