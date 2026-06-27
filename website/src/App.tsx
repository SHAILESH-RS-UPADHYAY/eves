import { Navbar } from './components/Navbar'
import { Hero3D } from './components/Hero3D'
import { FeaturesGrid } from './components/FeaturesGrid'
import { HowItWorks } from './components/HowItWorks'
import { IntegrationsSection } from './components/IntegrationsSection'
import { DownloadCTA } from './components/DownloadCTA'
import { Footer } from './components/Footer'

export function App() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <Navbar />
      <Hero3D />
      <FeaturesGrid />
      <HowItWorks />
      <IntegrationsSection />
      <DownloadCTA />
      <Footer />
    </div>
  )
}
