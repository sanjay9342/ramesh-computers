import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { STORE_INFO } from '../data/storeInfo'

function WhatsAppButton() {
  const phoneNumber = STORE_INFO.whatsappNumber
  const message = "Hi Sowmi Electronics, I'm interested in your computers, CCTV, and solar products."
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-fk-yellow text-white p-4 rounded-full shadow-lg hover:bg-fk-yellow-dark transition-all duration-300 z-50 cursor-pointer animate-pulse"
      aria-label="Contact on WhatsApp"
    >
      <FaWhatsapp className="text-3xl" />
    </a>
  )
}

export default WhatsAppButton
