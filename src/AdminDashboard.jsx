import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ users: 0, bookings: 0, materials: 0, printers: 0 });

  // Forms
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    basePrice: 0,
    stock: 0,
    minStock: 0.5,
    maxStock: 10,
    density: 1.2,
    colors: [],
    stockTiers: [{ minStock: 0, maxStock: 2, priceMultiplier: 1.2 }, { minStock: 2, maxStock: 5, priceMultiplier: 1.0 }, { minStock: 5, maxStock: 100, priceMultiplier: 0.9 }],
  });

  const [newPrinter, setNewPrinter] = useState({
    id: '',
    name: '',
    status: 'Available',
  });

  // Load data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [usersRes, materialsRes, printersRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/materials'),
        axios.get('http://localhost:5000/api/printers'),
        axios.get('http://localhost:5000/api/bookings'),
      ]);

      setUsers(usersRes.data || []);
      setMaterials(materialsRes.data || []);
      setPrinters(printersRes.data.printers || []);
      setBookings(bookingsRes.data || []);

      setStats({
        users: usersRes.data?.length || 0,
        bookings: bookingsRes.data?.length || 0,
        materials: materialsRes.data?.length || 0,
        printers: (printersRes.data.printers || []).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Material Management
  const addMaterial = async () => {
    try {
      await axios.post('http://localhost:5000/api/materials/add', newMaterial);
      setNewMaterial({
        name: '',
        basePrice: 0,
        stock: 0,
        minStock: 0.5,
        maxStock: 10,
        density: 1.2,
        colors: [],
        stockTiers: [{ minStock: 0, maxStock: 2, priceMultiplier: 1.2 }, { minStock: 2, maxStock: 5, priceMultiplier: 1.0 }, { minStock: 5, maxStock: 100, priceMultiplier: 0.9 }],
      });
      fetchAllData();
      alert('Material added successfully!');
    } catch (error) {
      alert('Error adding material: ' + error.message);
    }
  };

  const deleteMaterial = async (id) => {
    if (confirm('Delete this material?')) {
      try {
        await axios.delete(`http://localhost:5000/api/materials/${id}`);
        fetchAllData();
        alert('Material deleted');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const updateMaterialStock = async (id, newStock) => {
    try {
      await axios.put(`http://localhost:5000/api/materials/${id}`, { stock: newStock });
      fetchAllData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Printer Management
  const addPrinter = async () => {
    try {
      await axios.post('http://localhost:5000/api/printers/add', newPrinter);
      setNewPrinter({ id: '', name: '', status: 'Available' });
      fetchAllData();
      alert('Printer added successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const deletePrinter = async (id) => {
    if (confirm('Delete this printer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/printers/${id}`);
        fetchAllData();
        alert('Printer deleted');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  // User Management
  const deleteUser = async (id) => {
    if (confirm('Delete this user? This cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchAllData();
        alert('User deleted');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, { role: newRole });
      fetchAllData();
      alert('User role updated');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Booking Management
  const updateBookingStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status });
      fetchAllData();
      alert('Booking status updated');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const deleteBooking = async (id) => {
    if (confirm('Delete this booking?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`);
        fetchAllData();
        alert('Booking deleted');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-950 px-8 py-6 flex justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-4xl font-bold text-cyan-400">Smart Lab Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Full Lab Management & Monitoring System</p>
        </div>
        <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition">
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 p-8">
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-6 rounded-2xl border border-cyan-500/20">
          <h3 className="text-4xl font-bold text-cyan-400">{stats.users}</h3>
          <p className="text-slate-400 mt-2">Total Users</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20">
          <h3 className="text-4xl font-bold text-emerald-400">{stats.bookings}</h3>
          <p className="text-slate-400 mt-2">Total Bookings</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-6 rounded-2xl border border-orange-500/20">
          <h3 className="text-4xl font-bold text-orange-400">{stats.materials}</h3>
          <p className="text-slate-400 mt-2">Materials</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-6 rounded-2xl border border-purple-500/20">
          <h3 className="text-4xl font-bold text-purple-400">{stats.printers}</h3>
          <p className="text-slate-400 mt-2">Active Printers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['dashboard', 'materials', 'printers', 'bookings', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === tab ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-8">
        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold mb-8">Material Management with Dynamic Costing</h2>

            {/* Add Material Form */}
            <div className="bg-slate-800/50 p-6 rounded-xl mb-8 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Add New Material</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Material Name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                />
                <input
                  type="number"
                  placeholder="Base Price (₹/KG)"
                  value={newMaterial.basePrice}
                  onChange={(e) => setNewMaterial({ ...newMaterial, basePrice: parseFloat(e.target.value) })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                />
                <input
                  type="number"
                  placeholder="Stock (KG)"
                  value={newMaterial.stock}
                  onChange={(e) => setNewMaterial({ ...newMaterial, stock: parseFloat(e.target.value) })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                />
              </div>
              <button
                onClick={addMaterial}
                className="mt-4 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                Add Material
              </button>
            </div>

            {/* Materials List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Base Price</th>
                    <th className="p-4 text-left">Stock (KG)</th>
                    <th className="p-4 text-left">Colors</th>
                    <th className="p-4 text-left">Stock Tiers</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((mat) => (
                    <tr key={mat._id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                      <td className="p-4 font-semibold">{mat.name}</td>
                      <td className="p-4">₹{mat.basePrice}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={mat.stock}
                          onChange={(e) => updateMaterialStock(mat._id, parseFloat(e.target.value))}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 w-24 text-white"
                        />
                      </td>
                      <td className="p-4 text-sm">{mat.colors?.map((c) => c.colorName).join(', ') || 'None'}</td>
                      <td className="p-4 text-sm text-slate-300">
                        {mat.stockTiers?.map((t) => `${t.minStock}-${t.maxStock}KG: ${(t.priceMultiplier * 100).toFixed(0)}%`).join(' | ')}
                      </td>
                      <td className="p-4">
                        <button onClick={() => deleteMaterial(mat._id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Printers Tab */}
        {activeTab === 'printers' && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold mb-8">Printer Management</h2>

            {/* Add Printer Form */}
            <div className="bg-slate-800/50 p-6 rounded-xl mb-8 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Add New Printer</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Printer ID"
                  value={newPrinter.id}
                  onChange={(e) => setNewPrinter({ ...newPrinter, id: e.target.value })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="Printer Name"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                />
                <select
                  value={newPrinter.status}
                  onChange={(e) => setNewPrinter({ ...newPrinter, status: e.target.value })}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  <option>Available</option>
                  <option>Printing</option>
                  <option>Maintenance</option>
                </select>
              </div>
              <button
                onClick={addPrinter}
                className="mt-4 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                Add Printer
              </button>
            </div>

            {/* Printers List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Progress</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {printers.map((printer) => (
                    <tr key={printer._id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                      <td className="p-4 font-semibold">{printer.name}</td>
                      <td className="p-4">{printer.id}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            printer.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'
                          }`}
                        >
                          {printer.status}
                        </span>
                      </td>
                      <td className="p-4">{printer.progress || 0}%</td>
                      <td className="p-4">
                        <button onClick={() => deletePrinter(printer._id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold mb-8">Booking Management</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Printer</th>
                    <th className="p-4 text-left">Material</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Cost (₹)</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                      <td className="p-4">{booking.user}</td>
                      <td className="p-4">{booking.printer}</td>
                      <td className="p-4">{booking.material}</td>
                      <td className="p-4">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        >
                          <option>pending</option>
                          <option>confirmed</option>
                          <option>completed</option>
                          <option>cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 font-semibold">₹{booking.quote?.totalCost || 0}</td>
                      <td className="p-4 text-sm">{booking.date}</td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteBooking(booking._id)}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold mb-8">User Management</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Role</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                      <td className="p-4 font-semibold">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u._id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                        >
                          <option>admin</option>
                          <option>client</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={u.email === 'admin@smartlab.com'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">✅ System Status</h3>
                <p className="text-slate-300 mb-2">🔗 Database: Connected</p>
                <p className="text-slate-300 mb-2">🚀 API: Active</p>
                <p className="text-slate-300 mb-2">📦 Materials: {stats.materials}</p>
                <p className="text-slate-300">🖨️ Printers: {stats.printers}</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">📋 Quick Actions</h3>
                <p className="text-slate-300 mb-4">Full admin control available:</p>
                <ul className="text-slate-400 space-y-2 text-sm">
                  <li>✓ Dynamic material costing (material, color, stock)</li>
                  <li>✓ Stock-based pricing tiers</li>
                  <li>✓ Printer fleet management</li>
                  <li>✓ Booking & order control</li>
                  <li>✓ User role management</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}