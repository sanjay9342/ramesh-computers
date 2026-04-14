import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from '../Header'
import Footer from '../Footer'
import WhatsAppButton from '../WhatsAppButton'
import PageTransition from '../PageTransition'

function MainLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow px-3 sm:px-4 lg:px-8">
        <AnimatePresence mode="wait">
          <PageTransition routeKey={`${location.pathname}${location.search}`}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default MainLayout
