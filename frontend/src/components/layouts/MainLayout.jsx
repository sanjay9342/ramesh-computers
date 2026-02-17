import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'
import WhatsAppButton from '../WhatsAppButton'

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default MainLayout
