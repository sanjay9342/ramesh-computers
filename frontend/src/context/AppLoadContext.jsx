import React, { createContext, useContext, useMemo, useState } from 'react'

const AppLoadContext = createContext(null)

export const useAppLoad = () => useContext(AppLoadContext)

export function AppLoadProvider({ children }) {
  const [homeReady, setHomeReady] = useState(false)

  const value = useMemo(() => ({ homeReady, setHomeReady }), [homeReady])

  return <AppLoadContext.Provider value={value}>{children}</AppLoadContext.Provider>
}
