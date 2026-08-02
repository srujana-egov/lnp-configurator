import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from '@/context/ThemeContext'
import { LandingPage } from '@/pages/LandingPage'
import { WorkspacePage } from '@/pages/WorkspacePage'

function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
          </Routes>
        </BrowserRouter>
      </MotionConfig>
    </ThemeProvider>
  )
}

export default App
