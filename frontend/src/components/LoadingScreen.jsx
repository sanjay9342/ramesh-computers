import React from 'react'
import { STORE_INFO } from '../data/storeInfo'

function LoadingScreen({ text = 'Loading...', overlay = false, exiting = false }) {
  return (
    <div
      className={
        overlay
          ? `pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-white/36 backdrop-blur-[4px] transition-opacity duration-300 ${
              exiting ? 'opacity-0' : 'opacity-100'
            }`
          : 'bg-fk-bg min-h-screen flex items-center justify-center px-4'
      }
    >
      <div className={`flex flex-col items-center ${text ? 'gap-4' : 'gap-3'}`}>
        <div className={`loader-assembly ${overlay ? 'loader-assembly-compact' : ''}`}>
          <span className="loader-halo" />
          <span className="loader-ring loader-ring-outer" />
          <span className="loader-ring loader-ring-middle" />
          <span className="loader-ring loader-ring-inner" />
          <div className="loader-core">
            <img src={STORE_INFO.mark} alt={STORE_INFO.name} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="loader-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          {text ? <p className="text-sm font-medium text-[#7b6270] text-center">{text}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
