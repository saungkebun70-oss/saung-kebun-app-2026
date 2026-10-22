import { useState, useEffect } from 'react'

type UserRole = 'ketua' | 'bendahara' | 'warga' | 'petugas'

interface User {
  id: string
  name: string
  pin: string
  role: UserRole
  blockNumber?: string
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
  stampId?: string
}

const initialUsers: User[] = [
  { id: '1', name: 'Ahmad Suryadi', pin: '0001', role: 'ketua', isActive: true },
  { id: '2', name: 'Siti Rahayu', pin: '0002', role: 'bendahara', isActive: true },
  { id: '3', name: 'Budi Santoso', pin: '1001', role: 'warga', blockNumber: 'A-1', isActive: true },
  { id: '4', name: 'Dewi Lestari', pin: '1002', role: 'warga', blockNumber: 'A-2', isActive: true },
  { id: '5', name: 'Pak Joko', pin: '2001', role: 'petugas', blockNumber: 'P-1', isActive: true },
]

const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [users] = useState<User[]>(initialUsers)
  const [dues, setDues] = useState<MonthlyDue[]>([])
  const [page, setPage] = useState('dashboard')
  const [loginName, setLoginName] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (user) sessionStorage.setItem('user', JSON.stringify(user))
    else sessionStorage.removeItem('user')
  }, [user])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const found = users.find(u => u.name.toLowerCase() === loginName.toLowerCase() && u.pin === loginPin && u.isActive)
    if (found) {
      setUser(found)
      setLoginError('')
    } else {
      setLoginError('Nama atau PIN salah!')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setPage('dashboard')
  }

  if (!user) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div style={{background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <div style={{fontSize: '60px', marginBottom: '10px'}}>ðŸ </div>
            <h1 style={{fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px'}}>Saung Kebun</h1>
            <p style={{color: '#6b7280', fontSize: '14px'}}>Sistem Pengelolaan Keuangan Perumahan</p>
          </div>

          {loginError && (
            <div style={{background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px'}}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px'}}>Nama Lengkap</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'}}
                placeholder="Masukkan nama"
                required
              />
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px'}}>PIN (4 digit)</label>
              <input
                type="password"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'}}
                placeholder="Masukkan PIN"
                maxLength={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginPin.length < 4 || !loginName}
              style={{width: '100%', padding: '14px', background: loginPin.length < 4 || !loginName ? '#d1d5db' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'}}
            >
              ðŸ” Masuk
            </button>
          </form>

          <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '12px', color: '#6b7280'}}>
            <p style={{fontWeight: '600', marginBottom: '8px'}}>Demo Accounts:</p>
            <p>Ketua: Ahmad Suryadi / 0001</p>
            <p>Bendahara: Siti Rahayu / 0002</p>
            <p>Warga: Budi Santoso / 1001</p>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = user.role === 'ketua' || user.role === 'bendahara'
  const filteredDues = isAdmin ? dues : dues.filter(d => d.userId === user.id)
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div style={{display: 'flex', height: '100vh', background: '#f9fafb'}}>
      <div style={{width: '250px', background: 'white', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '24px', borderBottom: '1px solid #e5e7eb'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '40px', height: '40px', background: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>ðŸ </div>
            <div>
              <h2 style={{fontWeight: 'bold', color: '#1f2937', margin: 0, fontSize: '18px'}}>Saung Kebun</h2>
              <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>Keuangan Perumahan</p>
            </div>
          </div>
        </div>

        <nav style={{flex: 1, padding: '16px'}}>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li style={{marginBottom: '4px'}}>
              <button
                onClick={() => setPage('dashboard')}
                style={{width: '100%', padding: '12px 16px', background: page === 'dashboard' ? '#dcfce7' : 'transparent', color: page === 'dashboard' ? '#16a34a' : '#6b7280', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontWeight: page === 'dashboard' ? '600' : '400', fontSize: '14px'}}
              >
                ðŸ  Dashboard
              </button>
            </li>
            <li style={{marginBottom: '4px'}}>
              <button
                onClick={() => setPage('iuran')}
                style={{width: '100%', padding: '12px 16px', background: page === 'iuran' ? '#dcfce7' : 'transparent', color: page === 'iuran' ? '#16a34a' : '#6b7280', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontWeight: page === 'iuran' ? '600' : '400', fontSize: '14px'}}
              >
                ðŸ’° {isAdmin ? 'Iuran Warga' : 'Iuran Saya'}
              </button>
            </li>
            <li style={{marginBottom: '4px'}}>
              <button
                onClick={() => setPage('laporan')}
                style={{width: '100%', padding: '12px 16px', background: page === 'laporan' ? '#dcfce7' : 'transparent', color: page === 'laporan' ? '#16a34a' : '#6b7280', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontWeight: page === 'laporan' ? '600' : '400', fontSize: '14px'}}
              >
                ðŸ“Š Laporan
              </button>
            </li>
            {isAdmin && (
              <li style={{marginBottom: '4px'}}>
                <button
                  onClick={() => setPage('users')}
                  style={{width: '100%', padding: '12px 16px', background: page === 'users' ? '#dcfce7' : 'transparent', color: page === 'users' ? '#16a34a' : '#6b7280', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontWeight: page === 'users' ? '600' : '400', fontSize: '14px'}}
                >
                  ðŸ‘¥ Kelola Pengguna
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div style={{padding: '16px', borderTop: '1px solid #e5e7eb'}}>
          <button
            onClick={handleLogout}
            style={{width: '100%', padding: '12px 16px', background: 'transparent', color: '#dc2626', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px'}}
          >
            ðŸšª Keluar
          </button>
        </div>
      </div>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <header style={{background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h2 style={{fontWeight: '600', color: '#1f2937', margin: 0}}>Perumahan Saung Kebun</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '32px', height: '32px', background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px'}}>
              {user.name.charAt(0)}
            </div>
            <span style={{fontSize: '14px', fontWeight: '500', color: '#374151'}}>{user.name}</span>
          </div>
        </header>

        <main style={{flex: 1, overflow: 'auto', padding: '24px'}}>
          {page === 'dashboard' && (
            <div>
              <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>Dashboard</h1>
              <p style={{color: '#6b7280', marginBottom: '24px'}}>Selamat datang, {user.name}</p>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
                <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                  <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '8px'}}>Total Iuran</p>
                  <p style={{fontSize: '24px', fontWeight: 'bold', color: '#16a34a', margin: 0}}>
                    Rp {dues.filter(d => d.status === 'verified').reduce((s, d) => s + d.amount, 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                  <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '8px'}}>Menunggu Verifikasi</p>
                  <p style={{fontSize: '24px', fontWeight: 'bold', color: '#eab308', margin: 0}}>
                    {dues.filter(d => d.status === 'waiting_bendahara' || d.status === 'waiting_ketua').length}
                  </p>
                </div>
                <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                  <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '8px'}}>Total Warga</p>
                  <p style={{fontSize: '24px', fontWeight: 'bold', margin: 0}}>
                    {users.filter(u => u.role === 'warga').length} KK
                  </p>
                </div>
              </div>
            </div>
          )}

          {page === 'iuran' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <div>
                  <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>{isAdmin ? 'Iuran Warga' : 'Iuran Saya'}</h1>
                  <p style={{color: '#6b7280'}}>{isAdmin ? 'Kelola pembayaran iuran' : 'Bayar dan pantau iuran Anda'}</p>
                </div>
                {user.role === 'warga' && (
                  <button
                    onClick={() => {
                      const newDue: MonthlyDue = {
                        id: Date.now().toString(),
                        userId: user.id,
                        userName: user.name,
                        blockNumber: user.blockNumber || '-',
                        month: currentMonth,
                        year: currentYear,
                        amount: 100000,
                        status: 'waiting_bendahara',
                        paidAt: new Date().toISOString().split('T')[0],
                        proofImageName: 'bukti_pembayaran.jpg',
                        paymentMethod: 'Transfer BCA'
                      }
                      setDues([...dues, newDue])
                      alert('Pembayaran berhasil dikirim! Menunggu verifikasi bendahara.')
                    }}
                    style={{padding: '12px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'}}
                  >
                    ðŸ“¤ Bayar Iuran
                  </button>
                )}
              </div>

              <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead style={{background: '#f9fafb'}}>
                    <tr>
                      <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Nama</th>
                      <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Blok</th>
                      <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Periode</th>
                      <th style={{padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Jumlah</th>
                      <th style={{padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Status</th>
                      {isAdmin && <th style={{padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDues.map(d => (
                      <tr key={d.id} style={{borderTop: '1px solid #e5e7eb'}}>
                        <td style={{padding: '16px 24px', fontSize: '14px', fontWeight: '500'}}>{d.userName}</td>
                        <td style={{padding: '16px 24px', fontSize: '14px'}}>{d.blockNumber}</td>
                        <td style={{padding: '16px 24px', fontSize: '14px'}}>{months[d.month - 1]} {d.year}</td>
                        <td style={{padding: '16px 24px', fontSize: '14px', textAlign: 'right', fontWeight: '600'}}>Rp {d.amount.toLocaleString('id-ID')}</td>
                        <td style={{padding: '16px 24px', textAlign: 'center'}}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: d.status === 'verified' ? '#dcfce7' : d.status === 'waiting_ketua' ? '#fed7aa' : d.status === 'waiting_bendahara' ? '#fef3c7' : '#f3f4f6',
                            color: d.status === 'verified' ? '#16a34a' : d.status === 'waiting_ketua' ? '#ea580c' : d.status === 'waiting_bendahara' ? '#ca8a04' : '#6b7280'
                          }}>
                            {d.status === 'verified' ? 'âœ“ Verified' : d.status === 'waiting_ketua' ? 'M. Ketua' : d.status === 'waiting_bendahara' ? 'M. Bendahara' : 'Belum'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{padding: '16px 24px', textAlign: 'center'}}>
                            {user.role === 'bendahara' && d.status === 'waiting_bendahara' && (
                              <button
                                onClick={() => setDues(dues.map(x => x.id === d.id ? {...x, status: 'waiting_ketua'} : x))}
                                style={{padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'}}
                              >
                                âœ“ Verifikasi
                              </button>
                            )}
                            {user.role === 'ketua' && d.status === 'waiting_ketua' && (
                              <button
                                onClick={() => setDues(dues.map(x => x.id === d.id ? {...x, status: 'verified', stampId: 'STMP-' + Date.now()} : x))}
                                style={{padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'}}
                              >
                                ðŸ” Stempel
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                    {filteredDues.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} style={{padding: '32px', textAlign: 'center', color: '#6b7280'}}>
                          Belum ada data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {page === 'laporan' && (
            <div>
              <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '24px'}}>Laporan Keuangan</h1>
              <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '8px'}}>Total Iuran Terverifikasi</p>
                <p style={{fontSize: '32px', fontWeight: 'bold', color: '#16a34a', margin: 0}}>
                  Rp {dues.filter(d => d.status === 'verified').reduce((s, d) => s + d.amount, 0).toLocaleString('id-ID')}
                </p>
                <p style={{fontSize: '14px', color: '#6b7280', marginTop: '8px'}}>
                  {dues.filter(d => d.status === 'verified').length} pembayaran
                </p>
              </div>
            </div>
          )}

          {page === 'users' && isAdmin && (
            <div>
              <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '24px'}}>Kelola Pengguna</h1>
              <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead style={{background: '#f9fafb'}}>
                    <tr>
                      <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Nama</th>
                      <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Role</th>
                      <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>Blok</th>
                      <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280'}}>PIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{borderTop: '1px solid #e5e7eb'}}>
                        <td style={{padding: '16px 24px', fontSize: '14px', fontWeight: '500'}}>{u.name}</td>
                        <td style={{padding: '16px 24px', fontSize: '14px'}}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: u.role === 'ketua' ? '#f3e8ff' : u.role === 'bendahara' ? '#fef3c7' : u.role === 'warga' ? '#dcfce7' : '#dbeafe',
                            color: u.role === 'ketua' ? '#7c3aed' : u.role === 'bendahara' ? '#ca8a04' : u.role === 'warga' ? '#16a34a' : '#2563eb'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{padding: '16px 24px', fontSize: '14px'}}>{u.blockNumber || '-'}</td>
                        <td style={{padding: '16px 24px', fontSize: '14px', fontFamily: 'monospace'}}>{u.pin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
