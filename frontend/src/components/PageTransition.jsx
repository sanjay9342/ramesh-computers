import React from 'react'
import { motion } from 'framer-motion'

const pageTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
}

function PageTransition({ children, routeKey }) {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={pageTransition}
      className="min-h-full"
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
