import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import { CONTACT_NUMBERS, QUICK_LINK_CATEGORIES, STORE_INFO } from '../data/storeInfo'

function Footer() {
  const quickLinks = QUICK_LINK_CATEGORIES

  return (
    <footer className="w-full px-0 bg-gradient-to-br from-[#24131d] via-[#341827] to-[#150e14] text-gray-300">
      <div className="w-full px-0 py-12 pl-3 sm:pl-4 lg:pl-8 border-t border-fk-blue/25">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img
              src={STORE_INFO.logo}
              alt={STORE_INFO.name}
              className="h-16 w-auto max-w-[220px] object-contain mb-4"
            />
            <p className="text-sm mb-4 text-gray-300">{STORE_INFO.summary}</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-fk-blue transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-fk-teal transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-fk-blue transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-fk-blue transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm hover:text-fk-blue transition-colors">
                  All Products
                </Link>
              </li>
              {quickLinks.map((category) => (
                <li key={category.slug}>
                  <Link to={`/category/${category.slug}`} className="text-sm hover:text-fk-blue transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/policies?section=shipping" className="text-sm hover:text-fk-blue transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/policies?section=returns" className="text-sm hover:text-fk-blue transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/policies?section=privacy" className="text-sm hover:text-fk-blue transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-fk-blue transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 text-fk-teal" />
                <span className="text-sm">
                  {STORE_INFO.name}
                  <br />
                  {STORE_INFO.address}
                </span>
              </li>
              {CONTACT_NUMBERS.map((phone) => (
                <li key={phone.digits} className="flex items-center gap-2">
                  <FaPhone className="text-fk-teal" />
                  <a href={`tel:${phone.tel}`} className="text-sm hover:text-white transition-colors">
                    {phone.display}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-fk-teal" />
                <a href={`mailto:${STORE_INFO.email}`} className="text-sm hover:text-white transition-colors">
                  {STORE_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="w-full px-0 py-4 pl-3 sm:pl-4 lg:pl-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-400">
              Copyright {new Date().getFullYear()} {STORE_INFO.name}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" alt="Visa" className="h-8" />
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" alt="Mastercard" className="h-8" />
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazon/amazon-original.svg" alt="Amazon Pay" className="h-8" />
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google-pay/google-pay.svg" alt="GPay" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
