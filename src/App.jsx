import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Waitlist from './pages/Waitlist'
import Survey from './pages/Survey'
import Confirmed from './pages/Confirmed'
import { Privacy, Terms } from './pages/Legal'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Waitlist />} />
        <Route path="/survey"    element={<Survey />} />
        <Route path="/confirmed" element={<Confirmed />} />
        <Route path="/privacy"   element={<Privacy />} />
        <Route path="/terms"     element={<Terms />} />
      </Routes>
    </>
  )
}
