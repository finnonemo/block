import { useState } from 'react'
import AdminView from '@/views/AdminView'
import UserView from '@/views/UserView'

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('fnm-mode') ?? 'admin')

  const handleSetMode = (m) => {
    setMode(m)
    localStorage.setItem('fnm-mode', m)
  }

  if (mode === 'user') {
    return <UserView onSwitchMode={() => handleSetMode('admin')} />
  }

  return <AdminView onSwitchMode={() => handleSetMode('user')} />
}
