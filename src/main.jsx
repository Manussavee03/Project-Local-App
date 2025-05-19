import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function RedirectPage() {
  useEffect(() => {
    sessionStorage.redirect = window.location.href;
    window.location.replace('/');
  }, []);

  return <p>กำลังเปลี่ยนเส้นทาง...</p>;
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RedirectPage />
  </StrictMode>,
)
