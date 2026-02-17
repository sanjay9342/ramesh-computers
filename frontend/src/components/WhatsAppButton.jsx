import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'

function WhatsAppButton() {
  const phoneNumber = "919876543210" // Replace with actual number
  const message = "Hi Ramesh Computers, I'm interested in your products."

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <a
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 z-50 cursor-pointer animate-pulse"
      aria-label="Contact on WhatsApp"
    >
      <FaWhatsapp className="text-3xl" />
    </a>
  )
}

export default WhatsAppButton
