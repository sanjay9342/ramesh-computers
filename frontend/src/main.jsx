import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import App from './App.jsx'
import { store, persistor } from './redux/store'
import { AppLoadProvider } from './context/AppLoadContext.jsx'

import 'react-toastify/dist/ReactToastify.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AppLoadProvider>
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
