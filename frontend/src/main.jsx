import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import App from './App.jsx'
import { store, persistor } from './redux/store'
import LoadingScreen from './components/LoadingScreen.jsx'
import { AppLoadProvider } from './context/AppLoadContext.jsx'
import InitialLoadOverlay from './components/InitialLoadOverlay.jsx'
import { STORE_INFO } from './data/storeInfo.js'

import 'react-toastify/dist/ReactToastify.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen text={`Loading ${STORE_INFO.name}...`} />} persistor={persistor}>
        <BrowserRouter>
          <AppLoadProvider>
            <InitialLoadOverlay />
            <App />
            <ToastContainer
              position="top-right"
              autoClose={3200}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable={false}
              pauseOnHover
              theme="light"
              toastClassName="app-toast"
              bodyClassName="app-toast-body"
              progressClassName="app-toast-progress"
            />
          </AppLoadProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
