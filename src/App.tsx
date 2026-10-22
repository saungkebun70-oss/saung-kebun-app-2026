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

function LoginPage({ onLogin }: { onLogin: (name: string, pin: string) => boolean }) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!onLogin(name, pin)) setError('Nama atau PIN salah!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Saung Kebun</h1>
          <p className="text-gray-500 mt-1">Sistem Pengelolaan Keuangan Perumahan</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Masukkan nama" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4 digit)</label>
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Masukkan PIN" maxLength={4} required />
          </div>
          <button type="submit" disabled={pin.length < 4 || !name} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
            🔐 Masuk
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 text-center">
          <p className="font-semibold mb-2">Demo Accounts:</p>
          <p>Ketua: Ahmad Suryadi / 0001</p>
          <p>Bendahara: Siti Rahayu / 0002</p>
          <p>Warga: Budi Santoso / 1001</p>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ page, onNavigate, user, onLogout }: any) {
  const isAdmin = user.role === 'ketua' || user.role === 'bendahara'
  const menuItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'iuran', label: 'Iuran Warga', icon: '💰' },
        { id: 'laporan', label: 'Laporan', icon: '📊' },
        { id: 'users', label: 'Kelola Pengguna', icon: '👥' },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'iuran', label: 'Iuran Saya', icon: '💰' },
        { id: 'laporan', label: 'Laporan', icon: '📊' },
      ]

  return (
    <aside className="hidden lg:flex w-64 bg-white shadow-xl flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">🏠</div>
          <div>
            <h2 className="font-bold text-gray-800">Saung Kebun</h2>
            <p className="text-xs text-gray-500">Keuangan Perumahan</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.id}>
              <button onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${page === item.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50">
          <span className="text-xl">🚪</span> Keluar
        </button>
      </div>
    </aside>
  )
}

function Header({ user }: any) {
  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <h2 className="font-semibold text-gray-800">Perumahan Saung Kebun</h2>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">{user.name.charAt(0)}</div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
      </div>
    </header>
  )
}

function Dashboard({ user, dues, users }: any) {
  const isAdmin = user.role === 'ketua' || user.role === 'bendahara'
  const totalIncome = dues.filter((d: MonthlyDue) => d.status === 'verified').reduce((s: number, d: MonthlyDue) => s + d.amount, 0)
  const waiting = dues.filter((d: MonthlyDue) => d.status === 'waiting_bendahara' || d.status === 'waiting_ketua').length
  const wargaCount = users.filter((u: User) => u.role === 'warga').length

  if (user.role === 'warga') {
    const myDues = dues.filter((d: MonthlyDue) => d.userId === user.id)
    const paid = myDues.filter((d: MonthlyDue) => d.status !== 'unpaid').length
    const total = myDues.reduce((s: number, d: MonthlyDue) => s + d.amount, 0)

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Warga</h1>
        <p className="text-gray-500">Selamat datang, {user.name}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Blok</p>
            <p className="text-xl font-bold">{user.blockNumber}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Total Dibayar</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(total)}</p>
            <p className="text-xs text-gray-500">{paid} bulan</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Iuran/Bulan</p>
            <p className="text-xl font-bold text-blue-600">Rp 100.000</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b"><h3 className="font-semibold">Riwayat Pembayaran</h3></div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs text-gray-500">Bulan</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500">Jumlah</th>
                <th className="text-center px-6 py-3 text-xs text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myDues.map((d: MonthlyDue) => (
                <tr key={d.id}>
                  <td className="px-6 py-4 text-sm">{getMonthName(d.month)} {d.year}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(d.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'verified' ? 'bg-green-100 text-green-700' : d.status === 'waiting_ketua' ? 'bg-orange-100 text-orange-700' : d.status === 'waiting_bendahara' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                      {d.status === 'verified' ? '✓ Terverifikasi' : d.status === 'waiting_ketua' ? 'Menunggu Ketua' : d.status === 'waiting_bendahara' ? 'Menunggu Bendahara' : 'Belum Bayar'}
                    </span>
                  </td>
                </tr>
              ))}
              {myDues.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Belum ada data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p className="text-gray-500">Selamat datang, {user.name}</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Iuran</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
              <p className="text-xl font-bold text-yellow-600">{waiting}</p>
            </div>
            <span className="text-3xl">⏳</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Warga</p>
              <p className="text-xl font-bold">{wargaCount} KK</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Iuran/Bulan</p>
              <p className="text-xl font-bold text-blue-600">Rp 100.000</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function IuranPage({ user, dues, setDues, users }: any) {
  const isAdmin = user.role === 'ketua' || user.role === 'bendahara'
  const isKetua = user.role === 'ketua'
  const isBendahara = user.role === 'bendahara'
  const [showPayForm, setShowPayForm] = useState(false)
  const [selectedDue, setSelectedDue] = useState<MonthlyDue | null>(null)
  const [payForm, setPayForm] = useState({ proofName: '', method: '', note: '' })

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const filteredDues = isAdmin ? dues : dues.filter((d: MonthlyDue) => d.userId === user.id)

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    const newDue: MonthlyDue = {
      id: generateId(),
      userId: user.id,
      userName: user.name,
      blockNumber: user.blockNumber || '-',
      month: currentMonth,
      year: currentYear,
      amount: 100000,
      status: 'waiting_bendahara',
      paidAt: new Date().toISOString().split('T')[0],
      proofImageName: payForm.proofName,
      paymentMethod: payForm.method,
    }
    setDues((prev: MonthlyDue[]) => [...prev, newDue])
    setShowPayForm(false)
    setPayForm({ proofName: '', method: '', note: '' })
  }

  const handleVerifyBendahara = (due: MonthlyDue, approved: boolean) => {
    if (approved) {
      setDues((prev: MonthlyDue[]) => prev.map(d => d.id === due.id ? { ...d, status: 'waiting_ketua', verifiedByBendahara: user.id, verifiedAtBendahara: new Date().toISOString().split('T')[0] } : d))
    } else {
      setDues((prev: MonthlyDue[]) => prev.map(d => d.id === due.id ? { ...d, status: 'unpaid' } : d))
    }
    setSelectedDue(null)
  }

  const handleVerifyKetua = (due: MonthlyDue, approved: boolean) => {
    if (approved) {
      const stampId = 'STMP-' + due.year + '-' + String(Date.now()).slice(-4)
      setDues((prev: MonthlyDue[]) => prev.map(d => d.id === due.id ? { ...d, status: 'verified', verifiedByKetua: user.id, verifiedAtKetua: new Date().toISOString().split('T')[0], stampId } : d))
    }
    setSelectedDue(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{isAdmin ? 'Iuran Warga' : 'Iuran Saya'}</h1>
          <p className="text-gray-500 mt-1">{isAdmin ? 'Kelola pembayaran iuran' : 'Bayar dan pantau iuran Anda'}</p>
        </div>
        {user.role === 'warga' && (
          <button onClick={() => setShowPayForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            📤 Bayar Iuran
          </button>
        )}
      </div>

      {showPayForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between">
              <h3 className="text-lg font-semibold">Bayar Iuran {getMonthName(currentMonth)} {currentYear}</h3>
              <button onClick={() => setShowPayForm(false)}>✕</button>
            </div>
            <form onSubmit={handlePay} className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">Upload bukti pembayaran Anda. Bukti akan diverifikasi oleh Bendahara kemudian disetujui Ketua RT.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
                <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Pilih Metode</option>
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer Mandiri">Transfer Mandiri</option>
                  <option value="Transfer BRI">Transfer BRI</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Tunai">Tunai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Bukti</label>
                <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer block hover:border-green-400">
                  <input type="file" accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) setPayForm({ ...payForm, proofName: f.name }) }} className="hidden" required />
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-sm text-gray-600">Klik untuk upload bukti</p>
                  {payForm.proofName && <p className="text-xs text-green-600 mt-2">✓ {payForm.proofName}</p>}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan (opsional)</label>
                <textarea value={payForm.note} onChange={e => setPayForm({ ...payForm, note: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Kirim Pembayaran</button>
                <button type="button" onClick={() => setShowPayForm(false)} className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
                <p className="text-sm text-gray-500">{selectedDue.userName} • Blok {selectedDue.blockNumber}</p>
              </div>
              <button onClick={() => setSelectedDue(null)}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Periode</p>
                  <p className="font-semibold">{getMonthName(selectedDue.month)} {selectedDue.year}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Jumlah</p>
                  <p className="font-bold text-green-600">{formatCurrency(selectedDue.amount)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Metode</p>
                  <p className="font-semibold">{selectedDue.paymentMethod || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Tanggal Bayar</p>
                  <p className="font-semibold">{selectedDue.paidAt ? formatDate(selectedDue.paidAt) : '-'}</p>
                </div>
              </div>
              {selectedDue.proofImageName && (
                <div className="border rounded-lg p-4">
                  <p className="font-semibold mb-2">📄 Bukti Transaksi</p>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">{selectedDue.proofImageName}</p>
                  </div>
                </div>
              )}
              <div className="border rounded-lg p-4">
                <p className="font-semibold mb-3">🔏 Alur Verifikasi</p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedDue.status !== 'unpaid' ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <span className="text-white text-xs">1</span>
                    </div>
                    <div><p className="font-medium text-sm">Upload Bukti</p><p className="text-xs text-gray-500">{selectedDue.paidAt ? formatDate(selectedDue.paidAt) : 'Belum'}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedDue.verifiedByBendahara ? 'bg-blue-500' : selectedDue.status === 'waiting_bendahara' ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                      <span className="text-white text-xs">2</span>
                    </div>
                    <div><p className="font-medium text-sm">Verifikasi Bendahara</p><p className="text-xs text-gray-500">{selectedDue.verifiedByBendahara ? 'Diverifikasi ' + formatDate(selectedDue.verifiedAtBendahara || '') : selectedDue.status === 'waiting_bendahara' ? 'Menunggu...' : 'Belum'}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedDue.status === 'verified' ? 'bg-green-600' : selectedDue.status === 'waiting_ketua' ? 'bg-orange-400' : 'bg-gray-200'}`}>
                      <span className="text-white text-xs">3</span>
                    </div>
                    <div><p className="font-medium text-sm">Persetujuan Ketua</p><p className="text-xs text-gray-500">{selectedDue.status === 'verified' ? 'Disetujui ' + formatDate(selectedDue.verifiedAtKetua || '') : selectedDue.status === 'waiting_ketua' ? 'Menunggu...' : 'Belum'}</p></div>
                  </div>
                </div>
              </div>
              {selectedDue.status === 'verified' && selectedDue.stampId && (
                <div className="border-2 border-green-600 rounded-lg p-6 bg-green-50">
                  <p className="text-xs text-gray-500">Nomor Stempel</p>
                  <p className="font-mono font-bold text-green-700 text-lg">{selectedDue.stampId}</p>
                  <p className="text-xs text-gray-500 mt-1">Diterbitkan: {selectedDue.verifiedAtKetua ? formatDate(selectedDue.verifiedAtKetua) : '-'}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex gap-3">
              {isBendahara && selectedDue.status === 'waiting_bendahara' && (
                <>
                  <button onClick={() => handleVerifyBendahara(selectedDue, true)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">✓ Verifikasi</button>
                  <button onClick={() => handleVerifyBendahara(selectedDue, false)} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">Tolak</button>
                </>
              )}
              {isKetua && selectedDue.status === 'waiting_ketua' && (
                <>
                  <button onClick={() => handleVerifyKetua(selectedDue, true)} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">🔏 Setujui & Stempel</button>
                  <button onClick={() => handleVerifyKetua(selectedDue, false)} className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">Kembalikan</button>
                </>
              )}
              <button onClick={() => setSelectedDue(null)} className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Nama</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Blok</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Periode</th>
              <th className="text-right px-6 py-3 text-xs text-gray-500">Jumlah</th>
              <th className="text-center px-6 py-3 text-xs text-gray-500">Status</th>
              <th className="text-center px-6 py-3 text-xs text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDues.map((d: MonthlyDue) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{d.userName}</td>
                <td className="px-6 py-4 text-sm">{d.blockNumber}</td>
                <td className="px-6 py-4 text-sm">{getMonthName(d.month)} {d.year}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(d.amount)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'verified' ? 'bg-green-100 text-green-700' : d.status === 'waiting_ketua' ? 'bg-orange-100 text-orange-700' : d.status === 'waiting_bendahara' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {d.status === 'verified' ? '✓ Verified' : d.status === 'waiting_ketua' ? 'M. Ketua' : d.status === 'waiting_bendahara' ? 'M. Bendahara' : 'Belum'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => setSelectedDue(d)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs">Detail</button>
                </td>
              </tr>
            ))}
            {filteredDues.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LaporanPage({ dues }: any) {
  const verified = dues.filter((d: MonthlyDue) => d.status === 'verified')
  const totalIncome = verified.reduce((s: number, d: MonthlyDue) => s + d.amount, 0)
  const byMonth: Record<string, MonthlyDue[]> = {}
  verified.forEach((d: MonthlyDue) => {
    const key = getMonthName(d.month) + ' ' + d.year
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(d)
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Iuran Terverifikasi</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-500">{verified.length} pembayaran</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Bulan Aktif</p>
          <p className="text-xl font-bold">{Object.keys(byMonth).length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Rata-rata/Bulan</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(Object.keys(byMonth).length > 0 ? Math.round(totalIncome / Object.keys(byMonth).length) : 0)}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b"><h3 className="font-semibold">Rincian per Bulan</h3></div>
        <div className="divide-y">
          {Object.entries(byMonth).map(([month, items]) => (
            <div key={month} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{month}</p>
                  <p className="text-xs text-gray-500">{(items as MonthlyDue[]).length} pembayaran</p>
                </div>
                <p className="font-bold text-green-600">{formatCurrency((items as MonthlyDue[]).reduce((s, d) => s + d.amount, 0))}</p>
              </div>
            </div>
          ))}
          {Object.keys(byMonth).length === 0 && <div className="p-8 text-center text-gray-500">Belum ada data</div>}
        </div>
      </div>
    </div>
  )
}

function UsersPage({ users, setUsers }: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
      <div className="bg-white rounded-xl shadow-sm border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Nama</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Role</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">Blok</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500">PIN</th>
              <th className="text-center px-6 py-3 text-xs text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u: User) => (
              <tr key={u.id}>
                <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${u.role === 'ketua' ? 'bg-purple-100 text-purple-700' : u.role === 'bendahara' ? 'bg-yellow-100 text-yellow-700' : u.role === 'warga' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                <td className="px-6 py-4 text-sm">{u.blockNumber || '-'}</td>
                <td className="px-6 py-4 text-sm font-mono">{u.pin}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => setUsers((prev: User[]) => prev.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x))} className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Aktif' : 'Nonaktif'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
