import React from 'react'

function Policies() {
  return (
    <div className="bg-fk-bg min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Policies</h1>

        <section className="bg-white rounded shadow-fk p-5 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Privacy</h2>
          <p className="text-gray-600">
            We collect only what is needed to fulfill your orders and provide support. Data is not sold or shared with
            third parties for advertising. Payment details are processed via our payment partners and never stored on
            our servers.
          </p>
        </section>

        <section className="bg-white rounded shadow-fk p-5 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Returns & Refunds</h2>
          <p className="text-gray-600">
            Return window: 7 days for unused, undamaged items in original packaging. Refunds are issued to the original
            payment method within 5-7 business days after inspection. For DOA/defective items, we will arrange a
            replacement when stock is available.
          </p>
        </section>

        <section className="bg-white rounded shadow-fk p-5 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Shipping</h2>
          <p className="text-gray-600">
            Orders are dispatched within 24-48 hours on business days. Standard delivery is 2-5 business days depending
            on the destination. Delays caused by courier service disruptions are outside our control, but we will assist
            with tracking updates.
          </p>
        </section>

        <section className="bg-white rounded shadow-fk p-5 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Warranty</h2>
          <p className="text-gray-600">
            Manufacturer warranty applies to eligible products. Keep your invoice for claims. For support, contact us
            first; we can guide you to the right service center or handle the claim where applicable.
          </p>
        </section>

        <section className="bg-white rounded shadow-fk p-5 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Contact & Escalation</h2>
          <p className="text-gray-600">
            Support: support@rameshcomputers.com · +91 98765 43210. If an issue is unresolved within 3 business days,
            email escalation@rameshcomputers.com with your order ID.
          </p>
        </section>
      </div>
    </div>
  )
}

export default Policies
