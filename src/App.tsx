import { useState, useEffect } from 'react'

type UserRole = 'ketua' | 'bendahara' | 'warga' | 'petugas'

interface User {
  id: string
  name: string
  pin: string
  role: UserRole
  blockNumber?: string
  phone?: string
  isActive: boolean
}

interface MonthlyDue {
  id: string
  userId: string
  userName: string
  blockNumber: string
  month: number
  year: number
  amount: number
  status: 'unpaid' | 'waiting_bendahara' | 'waiting_ketua' | 'verified'
  paidAt?: string
  proofImageName?: string
  paymentMethod?: string
  verifiedByBendahara?: string
  verifiedAtBendahara?: string
  verifiedByKetua?: string
  verifiedAtKetua?: string
  stampId?: string
}

const initialUsers: User[] = [
  { id: '1', name: 'Ahmad Suryadi', pin: '0001', role: 'ketua', phone: '081234567890', isActive: true },
  { id: '2', name: 'Siti Rahayu', pin: '0002', role: 'bendahara', phone: '081234567891', isActive: true },
  { id: '3', name: 'Budi Santoso', pin: '1001', role: 'warga', blockNumber: 'A-1', phone: '081234567892', isActive: true },
  { id: '4', name: 'Dewi Lestari', pin: '1002', role: 'warga', blockNumber: 'A-2', phone: '081234567893', isActive: true },
  { id: '5', name: 'Pak Joko', pin: '2001', role: 'petugas', blockNumber: 'P-1', phone: '081234567894', isActive: true },
]

const getMonthName = (m: number) => ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][m-1]
const formatCurrency = (n: number) => 'Rp ' + n.toLocaleString('id-ID')
const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)
export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const s = sessionStorage.getItem('sk_user')
    return s ? JSON.parse(s) : null
  })
  const [users, setUsers] = useState<User[]>(() => {
    const s = localStorage.getItem('sk_users')
    return s ? JSON.parse(s) : initialUsers
  })
  const [dues, setDues] = useState<MonthlyDue[]>(() => {
    const s = localStorage.getItem('sk_dues')
    return s ? JSON.parse(s) : []
  })
  const [page, setPage] = useState('dashboard')

  useEffect(() => { localStorage.setItem('sk_users', JSON.stringify(users)) }, [users])
  useEffect(() => { localStorage.setItem('sk_dues', JSON.stringify(dues)) }, [dues])
  useEffect(() => {
    if (user) sessionStorage.setItem('sk_user', JSON.stringify(user))
    else sessionStorage.removeItem('sk_user')
  }, [user])

  const login = (name: string, pin: string) => {
    const found = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.pin === pin && u.isActive)
    if (found) { setUser(found); return true }
    return false
  }

  const logout = () => setUser(null)

  if (!user) return <LoginPage onLogin={login} />

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar page={page} onNavigate={setPage} user={user} onLogout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {page === 'dashboard' && <Dashboard user={user} dues={dues} users={users} />}
          {page === 'iuran' && <IuranPage user={user} dues={dues} setDues={setDues} users={users} />}
          {page === 'laporan' && <LaporanPage dues={dues} />}
          {page === 'users' && <UsersPage users={users} setUsers={setUsers} />}
        </main>
      </div>
    </div>
  )
}
