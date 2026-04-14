import React, { useMemo, useState } from 'react'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaLocationArrow } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { CONTACT_NUMBERS, STORE_INFO } from '../data/storeInfo'

const defaultCoords = STORE_INFO.mapCoords

const buildOsmEmbed = ({ lat, lon }) => {
  const delta = 0.01
  const bbox = [
    lon - delta,
    lat - delta,
    lon + delta,
    lat + delta,
  ]
    .map((v) => v.toFixed(5))
    .join('%2C')
  const marker = `${lat.toFixed(5)}%2C${lon.toFixed(5)}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`
}

function Contact() {
  const [coords, setCoords] = useState(defaultCoords)
  const [locating, setLocating] = useState(false)

  const mapSrc = useMemo(() => buildOsmEmbed(coords), [coords])

  const handleLocate = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported in this browser')
      return
    }
    setLocating(true)
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })
      const { latitude, longitude } = position.coords
      setCoords({ lat: latitude, lon: longitude })
      toast.success('Centered map to your location')
    } catch (err) {
      toast.error(err?.message || 'Unable to fetch location')
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="bg-fk-bg min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow-fk overflow-hidden">
            <div className="h-96">
              <iframe
                key={mapSrc}
                title="Store Location"
                src={mapSrc}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <button
                onClick={handleLocate}
                disabled={locating}
                className="inline-flex items-center gap-2 bg-fk-blue text-white px-4 py-2 rounded hover:bg-fk-blue-dark disabled:opacity-60"
              >
                <FaLocationArrow /> {locating ? 'Getting location...' : 'Use my current location'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded shadow-fk p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
            <p className="text-gray-600">
              We are here to help with computers, solar panels, solar lights, LED TV, stabilizers, DTH set-top boxes, and CCTV support.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-fk-blue mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Store & Service Center</p>
                  <p className="text-gray-600">{STORE_INFO.address}</p>
                </div>
              </div>
              {CONTACT_NUMBERS.map((phone) => (
                <div key={phone.digits} className="flex items-start gap-3">
                  <FaPhoneAlt className="text-fk-blue mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone</p>
                    <a href={`tel:${phone.tel}`} className="text-gray-600 hover:text-fk-blue transition-colors">
                      {phone.display}
                    </a>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-fk-blue mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <a href={`mailto:${STORE_INFO.email}`} className="text-gray-600 hover:text-fk-blue transition-colors">
                    {STORE_INFO.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaClock className="text-fk-blue mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Hours</p>
                  <p className="text-gray-600">{STORE_INFO.hours}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="font-semibold text-gray-800 mb-2">Available</p>
                <div className="flex flex-wrap gap-2">
                  {STORE_INFO.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full border border-fk-border bg-fk-bg px-3 py-1 text-xs font-semibold text-[#6f5a66]"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
