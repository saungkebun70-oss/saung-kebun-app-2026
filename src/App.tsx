import React, { useState } from 'react'

function App() {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')

  const handleLogin = () => {
    alert(`Login berhasil!\nNama: ${name}\nPIN: ${pin}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Saung Kebun</h1>
          <p className="text-gray-500 mt-1">Sistem Pengelolaan Keuangan</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Masukkan nama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Masukkan PIN"
              maxLength={4}
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Masuk
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 text-center">
          <p>Demo: Ahmad Suryadi / PIN: 0001</p>
        </div>
      </div>
    </div>
  )
}

export default App