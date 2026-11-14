import { useState } from 'react'
import { Intro } from './components/Intro'
import { Navbar } from './components/Navbar'
import { Hero3D } from './components/Hero3D'
import { FeaturesGrid } from './components/FeaturesGrid'
import { HowItWorks } from './components/HowItWorks'
import { IntegrationsSection } from './components/IntegrationsSection'
import { DownloadCTA } from './components/DownloadCTA'
import { Footer } from './components/Footer'
import { currentTheme } from './lib'

export function App() {
  const [theme, setTheme] = useState(currentTheme)
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <Intro />
      <Navbar theme={theme} onTheme={setTheme} />
      <Hero3D theme={theme} />
      <FeaturesGrid />
      <HowItWorks />
      <IntegrationsSection />
      <DownloadCTA />
      <Footer />
    </div>
  )
}
