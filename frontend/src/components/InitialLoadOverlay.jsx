import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import { useAppLoad } from '../context/AppLoadContext'

function InitialLoadOverlay() {
  const location = useLocation()
  const { homeReady } = useAppLoad() || {}
  const [minElapsed, setMinElapsed] = useState(false)
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  const shouldWaitForHome = useMemo(() => location.pathname === '/', [location.pathname])

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const homeDone = !shouldWaitForHome || homeReady
    if (minElapsed && homeDone && !exiting) {
      setExiting(true)
      const timer = setTimeout(() => setVisible(false), 280)
      return () => clearTimeout(timer)
    }
  }, [exiting, homeReady, minElapsed, shouldWaitForHome])

  if (!shouldWaitForHome || !visible) return null

  return <LoadingScreen text="" overlay exiting={exiting} />
}

export default InitialLoadOverlay
