import { useEffect, useRef, useState } from 'react'
import './NavBar.css'

const services = [
  { id: 'merge-pdf', label: 'Merge PDF' },
  { id: 'split-pdf', label: 'Split PDF' },
  { id: 'compress-pdf', label: 'Compress PDF' },
  { id: 'image-to-pdf', label: 'Image to PDF' },
]

function NavBar({ currentPage, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <header className="nav-header">
      <div className="nav-brand">PDFNova</div>

      <nav className="nav-menu" aria-label="Main navigation">
        <button type="button" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}>
          Home
        </button>

        <div className="nav-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="nav-link nav-dropdown-btn"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            Service
            <span className={isOpen ? 'caret open' : 'caret'}>▼</span>
          </button>

          {isOpen ? (
            <ul className="dropdown-menu" role="menu" aria-label="Service menu">
              {services.map((service) => (
                <li key={service.id} role="none">
                  <button 
                    type="button" 
                    role="menuitem" 
                    className={`dropdown-item ${currentPage === service.id ? 'active' : ''}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (['split-pdf', 'merge-pdf', 'image-to-pdf', 'compress-pdf'].includes(service.id)) {
                        setCurrentPage(service.id);
                        window.scrollTo(0, 0);
                      } else {
                        alert('This tool is not yet implemented!');
                      }
                    }}
                  >
                    {service.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button type="button" className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`} onClick={() => { setCurrentPage('contact'); window.scrollTo(0, 0); }}>
          Contact Us
        </button>
      </nav>
    </header>
  )
}

export default NavBar
