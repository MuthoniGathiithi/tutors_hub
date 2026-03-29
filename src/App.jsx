import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Dojo from './pages/Dojo'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dojo" element={<Dojo />} />
      <Route path="/dojo/:studentId" element={<Dojo />} />
    </Routes>
  )
}
