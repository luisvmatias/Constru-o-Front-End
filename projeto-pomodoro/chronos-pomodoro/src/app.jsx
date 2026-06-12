import { AppRouter } from './router/AppRouter'
import { AuthContextProvider } from './contexts/AuthContext'

export function App() {
  return (
    <AuthContextProvider>
      <AppRouter />
    </AuthContextProvider>
  )
}