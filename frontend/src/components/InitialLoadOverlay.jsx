import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import { useAppLoad } from '../context/AppLoadContext'
import { STORE_INFO } from '../data/storeInfo'

function InitialLoadOverlay() {
  const location = useLocation()
  const { homeReady } = useAppLoad() || {}
  const [minElapsed, setMinElapsed] = useState(false)
  const [visible, setVisible] = useState(true)

  const shouldWaitForHome = useMemo(() => location.pathname === '/', [location.pathname])

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const homeDone = !shouldWaitForHome || homeReady
    if (minElapsed && homeDone) {
      setVisible(false)
    }
  }, [homeReady, minElapsed, shouldWaitForHome])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-fk-blue/30 border-t-fk-blue animate-spin"></div>
        <img
          src={STORE_INFO.mark}
          alt={STORE_INFO.name}
          className="w-11 h-11 absolute inset-0 m-auto object-contain"
        />
      </div>
    </div>
  )
}

export default InitialLoadOverlay
