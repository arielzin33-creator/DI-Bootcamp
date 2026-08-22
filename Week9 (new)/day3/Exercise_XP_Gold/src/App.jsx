import { useSelector } from 'react-redux'
import LoginForm from './components/LoginForm'
import UserProfile from './components/UserProfile'
import './App.css'

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return <div className="app">{isAuthenticated ? <UserProfile /> : <LoginForm />}</div>
}

export default App
