import React, { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CONTACT_NUMBER_TEXT, STORE_INFO } from '../data/storeInfo'

const sections = [
  {
    id: 'privacy',
    title: 'Privacy',
    text:
      'We collect only what is needed to fulfill your orders and provide support. Data is not sold or shared with third parties for advertising. Payment details are processed via our payment partners and never stored on our servers.',
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    text:
      'Return window: 7 days for unused, undamaged items in original packaging. Refunds are issued to the original payment method within 5-7 business days after inspection. For DOA or defective items, we arrange a replacement when stock is available.',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    text:
      'Orders are dispatched within 24-48 hours on business days. Standard delivery is 2-5 business days depending on the destination. If a courier delay happens, we will stay with the shipment until it is resolved.',
  },
  {
    id: 'warranty',
    title: 'Warranty',
    text:
      'Manufacturer warranty applies to eligible products. Keep your invoice for claims. For support, contact us first so we can guide you to the right service center or help handle the claim.',
  },
  {
    id: 'support',
    title: 'Contact & Escalation',
    text:
      `Support: ${STORE_INFO.email} | ${CONTACT_NUMBER_TEXT}. If an issue is unresolved within 3 business days, contact ${STORE_INFO.email} with your order ID.`,
  },
]

function Policies() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSection = searchParams.get('section') || 'privacy'

  const activeIndex = useMemo(
    () => Math.max(0, sections.findIndex((section) => section.id === activeSection)),
    [activeSection]
  )

  useEffect(() => {
    const sectionId = sections[activeIndex]?.id
    if (!sectionId) return
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeIndex])

  return (
    <div className="bg-fk-bg min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-0 space-y-6">
        <div className="bg-white rounded shadow-fk p-5">
          <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSearchParams({ section: section.id })}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  section.id === sections[activeIndex]?.id
                    ? 'bg-fk-blue text-white'
                    : 'bg-fk-bg text-fk-blue hover:bg-fk-border'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={`bg-white rounded shadow-fk p-5 space-y-2 ${
              section.id === sections[activeIndex]?.id ? 'ring-2 ring-fk-yellow' : ''
            }`}
          >
            <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
            <p className="text-gray-600">{section.text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Policies
