import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Bounce, ToastContainer } from 'react-toastify'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        transition={Bounce}
        style={{width: "73%", left: '13.5%'}}
      />
    
  </StrictMode>,
)
