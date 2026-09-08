import PromoBar from '../components/landing/PromoBar'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import CanchasSection from '../components/landing/CanchasSection'
import Instalaciones from '../components/landing/Instalaciones'
import ComoFunciona from '../components/landing/ComoFunciona'
import Nosotros from '../components/landing/Nosotros'
import Ubicacion from '../components/landing/Ubicacion'
import ContactoFooter from '../components/landing/ContactoFooter'
import WhatsAppButton from '../components/landing/WhatsAppButton'

export default function Landing() {
  return (
    <>
      <PromoBar />
      <Navbar />
      <main>
        <Hero />
        <CanchasSection />
        <Instalaciones />
        <ComoFunciona />
        <Nosotros />
        <Ubicacion />
        <ContactoFooter />
      </main>
      <WhatsAppButton />
    </>
  )
}
