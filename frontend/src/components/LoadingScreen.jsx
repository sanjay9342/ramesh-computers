import React from 'react'
import { STORE_INFO } from '../data/storeInfo'

function LoadingScreen({ text = 'Loading...' }) {
  return (
    <div className="bg-fk-bg min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-fk-blue/30 border-t-fk-blue animate-spin"></div>
          <img
            src={STORE_INFO.mark}
            alt={STORE_INFO.name}
            className="w-11 h-11 absolute inset-0 m-auto object-contain"
          />
        </div>
        {text ? <p className="text-sm text-[#7b6270]">{text}</p> : null}
      </div>
    </div>
  )
}

export default LoadingScreen
