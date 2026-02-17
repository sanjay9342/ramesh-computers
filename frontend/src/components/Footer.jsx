import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About Ramesh Computers</h3>
            <p className="text-sm mb-4">
              Your trusted destination for laptops, desktops, and accessories. 
              Sales & Service | Wholesale & Retail
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-fk-blue transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/category/laptops" className="text-sm hover:text-white transition-colors">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/category/desktops" className="text-sm hover:text-white transition-colors">
                  Desktops
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="text-sm hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping-policy" className="text-sm hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-sm hover:text-white transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 text-fk-yellow" />
                <span className="text-sm">
                  Ramesh Computers<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="text-fk-yellow" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <FaWhatsapp className="text-fk-yellow" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-fk-yellow" />
                <span className="text-sm">info@rameshcomputers.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Ramesh Computers. All rights reserved.
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
