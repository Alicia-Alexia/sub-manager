import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  return session ? <>{children}</> : <Navigate to="/auth" />
}

function AppRoutes() {
  const { session } = useAuth()

  return (
    <Routes>
      <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
              <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}


function App() {
  return (
    <QueryClientProvider client={queryClient}> 
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App