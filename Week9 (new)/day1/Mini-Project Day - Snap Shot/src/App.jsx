import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/SnapScout/:query" element={<Gallery />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
