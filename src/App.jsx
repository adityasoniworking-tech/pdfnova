import { useState } from 'react'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import Contact from './pages/Contact.jsx'
import SplitPdf from './pages/SplitPdf.jsx'
import MergePdf from './pages/MergePdf.jsx'
import ImageToPdf from './pages/ImageToPdf.jsx'
import CompressPdf from './pages/CompressPdf.jsx'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <>
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="app-main">
        {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'split-pdf' && <SplitPdf />}
        {currentPage === 'merge-pdf' && <MergePdf />}
        {currentPage === 'image-to-pdf' && <ImageToPdf />}
        {currentPage === 'compress-pdf' && <CompressPdf />}
      </main>
    </>
  )
}

export default App
