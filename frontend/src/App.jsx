import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Registro from './pages/Registro'
import ReservarPage from './pages/ReservarPage'
import DashboardPage from './pages/DashboardPage'
import ReservaConfirmada from './pages/ReservaConfirmada'
import PagoResultado from './pages/PagoResultado'
import MisReservas from './pages/MisReservas'
import Historial from './pages/Historial'

function RutaProtegida({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/reservar/:canchaId"
            element={
              <RutaProtegida>
                <ReservarPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/reserva-confirmada/:reservaId"
            element={
              <RutaProtegida>
                <ReservaConfirmada />
              </RutaProtegida>
            }
          />
          <Route
            path="/pago-resultado/:reservaId"
            element={
              <RutaProtegida>
                <PagoResultado />
              </RutaProtegida>
            }
          />
          <Route
            path="/historial"
            element={
              <RutaProtegida>
                <Historial />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
