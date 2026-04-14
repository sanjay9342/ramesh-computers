import React from 'react'
import { Link } from 'react-router-dom'
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import { CONTACT_NUMBERS, QUICK_LINK_CATEGORIES, STORE_INFO } from '../data/storeInfo'

const buildOsmEmbed = ({ lat, lon }) => {
  const delta = 0.01
  const bbox = [
    lon - delta,
    lat - delta,
    lon + delta,
    lat + delta,
  ]
    .map((value) => value.toFixed(5))
    .join('%2C')
  const marker = `${lat.toFixed(5)}%2C${lon.toFixed(5)}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`
}

function Footer() {
  const footerMapSrc = buildOsmEmbed(STORE_INFO.mapCoords)
  const quickLinks = QUICK_LINK_CATEGORIES
  const primaryPhone = CONTACT_NUMBERS[0]
  const directionsUrl = `https://www.openstreetmap.org/?mlat=${STORE_INFO.mapCoords.lat}&mlon=${STORE_INFO.mapCoords.lon}#map=16/${STORE_INFO.mapCoords.lat}/${STORE_INFO.mapCoords.lon}`

  return (
    <footer className="w-full border-t border-fk-border bg-[linear-gradient(180deg,#fffaff_0%,#fff6fc_46%,#fdefff_100%)] text-[#2a1830]">
      <div className="h-1 w-full bg-[linear-gradient(90deg,#b326b6_0%,#e17adf_52%,#f3a6ef_100%)]" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="border-b border-fk-border pb-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <section className="lg:col-span-4">
              <img
                src={STORE_INFO.logo}
                alt={STORE_INFO.name}
                className="h-16 w-auto max-w-[230px] object-contain"
              />

              <p className="mt-5 max-w-md text-sm leading-7 text-[#6f5a74] sm:text-base">
                Trusted sales, service, wholesale, and retail support for computers, CCTV, solar panels, and everyday electronics in Trichy.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {STORE_INFO.services.slice(0, 6).map((service) => (
                  <span
                    key={service}
                    className="rounded-md border border-fk-border bg-white px-3 py-1.5 text-xs font-semibold text-[#6f5a74] shadow-[0_6px_18px_rgba(133,29,136,0.05)]"
                  >
                    {service}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`tel:${primaryPhone.tel}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-fk-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-fk-blue-dark"
                >
                  <FaPhone className="text-xs" />
                  Call Now
                </a>
                <a
                  href={`mailto:${STORE_INFO.email}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-fk-border bg-white px-4 py-3 text-sm font-semibold text-fk-blue transition hover:border-fk-blue hover:bg-[#fff9ff]"
                >
                  <FaEnvelope className="text-xs" />
                  Email Us
                </a>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-fk-border bg-white px-4 py-3 text-sm font-semibold text-fk-blue transition hover:border-fk-blue hover:bg-[#fff9ff]"
                >
                  <FaMapMarkerAlt className="text-xs" />
                  Directions
                </a>
              </div>
            </section>

            <section className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fk-blue">Support</p>
              <h3 className="mt-3 text-lg font-bold text-[#2a1830]">Customer Service</h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link to="/policies?section=shipping" className="text-sm text-[#6f5a74] transition hover:text-fk-blue">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link to="/policies?section=returns" className="text-sm text-[#6f5a74] transition hover:text-fk-blue">
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link to="/policies?section=privacy" className="text-sm text-[#6f5a74] transition hover:text-fk-blue">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-[#6f5a74] transition hover:text-fk-blue">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </section>

            <section className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fk-blue">Browse</p>
              <h3 className="mt-3 text-lg font-bold text-[#2a1830]">Quick Links</h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link to="/products" className="text-sm text-[#6f5a74] transition hover:text-fk-blue">
                    All Products
                  </Link>
                </li>
                {quickLinks.map((category) => (
                  <li key={category.slug}>
                    <Link to={`/category/${category.slug}`} className="text-sm text-[#6f5a74] transition hover:text-fk-blue">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fk-blue">Reach Us</p>
              <h3 className="mt-3 text-lg font-bold text-[#2a1830]">Contact</h3>

              <ul className="mt-5 space-y-4">
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 text-fk-blue" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9a7a88]">Store</p>
                    <p className="mt-1 text-sm leading-6 text-[#6f5a74]">{STORE_INFO.address}</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <FaPhone className="mt-1 text-fk-blue" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9a7a88]">Sales</p>
                    <a href={`tel:${primaryPhone.tel}`} className="mt-1 inline-block text-sm text-[#6f5a74] transition hover:text-fk-blue">
                      {primaryPhone.display}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <FaEnvelope className="mt-1 text-fk-blue" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9a7a88]">Email</p>
                    <a
                      href={`mailto:${STORE_INFO.email}`}
                      className="mt-1 inline-block break-all text-sm text-[#6f5a74] transition hover:text-fk-blue"
                    >
                      {STORE_INFO.email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <FaClock className="mt-1 text-fk-blue" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9a7a88]">Hours</p>
                    <p className="mt-1 text-sm text-[#6f5a74]">{STORE_INFO.hours}</p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fk-blue">Location</p>
              <h3 className="mt-3 text-lg font-bold text-[#2a1830]">Store Map</h3>

              <div className="mt-5 overflow-hidden rounded-md border border-fk-border bg-white shadow-[0_12px_30px_rgba(133,29,136,0.08)]">
                <div className="aspect-[16/11]">
                  <iframe
                    title={`${STORE_INFO.name} map`}
                    src={footerMapSrc}
                    className="h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold text-[#2a1830]">{STORE_INFO.location}</p>
              <p className="mt-1 text-sm text-[#6f5a74]">{STORE_INFO.cityState}</p>
            </section>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 text-sm text-[#7e677f] md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} {STORE_INFO.name}. All rights reserved.</p>
          <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span>{STORE_INFO.cityState}</span>
            <span>{STORE_INFO.hours}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
