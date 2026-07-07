import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const tabs = ['dashboard', 'materials', 'printers', 'bookings', 'users'];

const emptyMaterial = {
  name: '',
  basePrice: 0,
  stock: 0,
  minStock: 0.5,
  maxStock: 10,
  density: 1.2,
  colors: [],
  stockTiers: [
    { minStock: 0, maxStock: 2, priceMultiplier: 1.2 },
    { minStock: 2, maxStock: 5, priceMultiplier: 1.0 },
    { minStock: 5, maxStock: 100, priceMultiplier: 0.9 },
  ],
};

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [materials, setMaterials] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ users: 0, bookings: 0, materials: 0, printers: 0 });
  const [newMaterial, setNewMaterial] = useState(emptyMaterial);
  const [newPrinter, setNewPrinter] = useState({ id: '', name: '', status: 'Available' });
  const [bambuConfig, setBambuConfig] = useState({ printerId: '', ipAddress: '', serialNumber: '', accessCode: '' });

  async function fetchAllData() {
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
  }

  useEffect(() => {
    // Keep the existing mount-time data load behavior; the async function updates state after API responses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllData();
  }, []);

  const addMaterial = async () => {
    try {
      await axios.post('http://localhost:5000/api/materials/add', newMaterial);
      setNewMaterial(emptyMaterial);
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

  const syncPrinter = async (printerId) => {
    try {
      await axios.post(`http://localhost:5000/api/printers/${printerId}/sync`);
      fetchAllData();
      alert('Printer status synchronized');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to synchronize printer');
    }
  };

  const saveBambuConfig = async () => {
    const printer = printers.find((item) => item._id === bambuConfig.printerId);
    if (!printer || !bambuConfig.ipAddress || !bambuConfig.serialNumber || !bambuConfig.accessCode) {
      alert('Select a Bambu printer and enter its IP, serial number, and access code');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/printers/${printer._id}`, {
        apiProvider: 'bambulabs-api',
        connection: 'Bambu Labs MQTT',
        ipAddress: bambuConfig.ipAddress,
        serialNumber: bambuConfig.serialNumber,
        accessCode: bambuConfig.accessCode,
      });
      setBambuConfig({ printerId: '', ipAddress: '', serialNumber: '', accessCode: '' });
      fetchAllData();
      alert('Bambu connection saved');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to save Bambu connection');
    }
  };

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

  const addColor = () => {
  const color = colorInput.trim();

  if (!color) return;

  // Prevent duplicate colors
  if (
    newMaterial.colors.some(
      (c) => c.colorName.toLowerCase() === color.toLowerCase()
    )
  ) {
    alert("Color already exists.");
    return;
  }

  setNewMaterial({
    ...newMaterial,
    colors: [
      ...newMaterial.colors,
      {
        colorName: color,
        surcharge: 0,
      },
    ],
  });

  setColorInput("");
};

const removeColor = (index) => {
  setNewMaterial({
    ...newMaterial,
    colors: newMaterial.colors.filter((_, i) => i !== index),
  });
};

  const metrics = useMemo(
    () => [
      { label: 'Users', value: stats.users, tone: 'text-sky-700', helper: 'registered accounts' },
      { label: 'Bookings', value: stats.bookings, tone: 'text-emerald-700', helper: 'orders in system' },
      { label: 'Materials', value: stats.materials, tone: 'text-amber-700', helper: 'filaments tracked' },
      { label: 'Printers', value: stats.printers, tone: 'text-indigo-700', helper: 'machines online' },
    ],
    [stats],
  );

  return (
    <div className="min-h-screen bg-[#eef3f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Smart Lab console</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Admin operations</h1>
            <p className="mt-1 text-sm text-slate-600">Signed in as {user?.name || user?.email || 'Administrator'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              API connected
            </span>
            <button
              onClick={onLogout}
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        <section className="metric-sequence grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="motion-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <strong className={`text-4xl font-semibold ${metric.tone}`}>{metric.value}</strong>
                <span className="text-right text-xs uppercase tracking-[0.18em] text-slate-400">{metric.helper}</span>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-w-28 rounded-md px-4 py-2.5 text-sm font-semibold capitalize transition ${
                activeTab === tab ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <section key={activeTab} className="motion-panel mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Dashboard overview</h2>
                  <p className="mt-1 text-sm text-slate-600">A quick read on lab health, inventory, and work queue.</p>
                </div>
                <button onClick={fetchAllData} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                  Refresh data
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-950">System status</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Database', 'Connected'],
                      ['API', 'Active'],
                      ['Materials', `${stats.materials} records`],
                      ['Printers', `${stats.printers} machines`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
                  <h3 className="text-base font-semibold">Priority actions</h3>
                  <div className="mt-5 space-y-3 text-sm text-slate-300">
                    <p>Review pending bookings and confirm print slots.</p>
                    <p>Check low-stock materials before approving new quotes.</p>
                    <p>Keep printer status current before clients upload files.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <PanelTitle title="Materials" caption="Manage filament pricing, stock, and dynamic costing." />
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Add New Material</h2>
                <p className="mt-1 text-sm text-slate-500">Fill in the material details and available colors.</p>
                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  {/* Material Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Material Name</label>
                    <input type="text" value={newMaterial.name} onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })} placeholder="e.g. PLA+" className="form-input w-full"/>
                  </div>
                  {/* Base Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Base Price (₹ / kg)</label>
                    <input type="number" value={newMaterial.basePrice} onChange={(e) => setNewMaterial({ ...newMaterial, basePrice: parseFloat(e.target.value) || 0, }) } placeholder="1200" className="form-input w-full" />
                  </div>
                  {/* Stock */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700"> Available Stock (kg) </label>
                    <input type="number" value={newMaterial.stock} onChange={(e) => setNewMaterial({ ...newMaterial, stock: parseFloat(e.target.value) || 0, }) } placeholder="10" className="form-input w-full"/>
                  </div>
                  {/* Density */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700"> Density (g/cm³) </label>
                    <input type="number" step="0.01" value={newMaterial.density} onChange={(e) => setNewMaterial({ ...newMaterial, density: parseFloat(e.target.value) || 0, }) }  placeholder="1.24" className="form-input w-full"/>
                  </div> 
                  {/* Minimum Stock */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700"> Minimum Stock Alert </label>
                    <input type="number" value={newMaterial.minStock} onChange={(e) => setNewMaterial({ ...newMaterial, minStock: parseFloat(e.target.value) || 0, }) } className="form-input w-full" />
                  </div> 
                  {/* Maximum Stock */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700"> Maximum Stock </label>
                    <input type="number" value={newMaterial.maxStock} onChange={(e) => setNewMaterial({ ...newMaterial, maxStock: parseFloat(e.target.value) || 0, }) } placeholder="10" className="form-input w-full" />
                  </div> 
                </div> 
                {/* Colors */}
                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800"> Material Colors </h3>
                      <p className="text-sm text-slate-500"> Add all colors available for this material. </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="Enter color name" className="form-input flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addColor(); } 
                      }} />
                    <button type="button" onClick={addColor} className="rounded-lg bg-blue-600 px-5 font-medium text-white hover:bg-blue-700">+ Add Color </button>
                  </div>
                  {newMaterial.colors.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {newMaterial.colors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
                          <span className="h-3 w-3 rounded-full border" style={{backgroundColor: color.colorName.toLowerCase(),}} />
                          <span className="font-medium">{color.colorName}</span>
                          <button type="button" onClick={() => removeColor(index)} className="text-red-500 hover:text-red-700" >✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500"> No colors added yet. </div>
                  )}
                </div>
                {/* Submit */}
                <div className="mt-8 flex justify-end">
                  <button onClick={addMaterial} className="rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" >Add Material</button>
                </div>
              </div>
              <DataTable headers={['Name', 'Base price', 'Stock', 'Colors', 'Tiers', 'Actions']}>
                {materials.map((mat) => (
                  <tr key={mat._id} className="table-row">
                    <td className="table-cell font-semibold">{mat.name}</td>
                    <td className="table-cell">INR {mat.basePrice}</td>
                    <td className="table-cell">
                      <input type="number" value={mat.stock} onChange={(e) => updateMaterialStock(mat._id, parseFloat(e.target.value))} className="w-24 rounded-md border border-slate-300 px-2 py-1" />
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-2">
                        {mat.colors?.length ? (
                          mat.colors.map((c, index) => (
                            <span key={index} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium"
                              style={{backgroundColor: c.colorName.toLowerCase(),color: ["white", "black", "yellow", "lime", "cyan"].includes( c.colorName.toLowerCase())? "#000": "#fff",}}></span>
                          ))
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-xs">{mat.stockTiers?.map((t) => `${t.minStock}-${t.maxStock}kg: ${(t.priceMultiplier * 100).toFixed(0)}%`).join(' | ')}</td>
                    <td className="table-cell"><DangerButton onClick={() => deleteMaterial(mat._id)}>Delete</DangerButton></td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {activeTab === 'printers' && (
            <div>
              <PanelTitle title="Printers" caption="Register machines and keep availability accurate." />
              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                <input value={newPrinter.id} onChange={(e) => setNewPrinter({ ...newPrinter, id: e.target.value })} placeholder="Printer ID" className="form-input" />
                <input value={newPrinter.name} onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })} placeholder="Printer name" className="form-input md:col-span-2" />
      
                <button onClick={addPrinter} className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 md:col-start-4">Add printer</button>
              </div>
              <div className="mt-4 grid gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4 md:grid-cols-5">
                <select value={bambuConfig.printerId} onChange={(e) => setBambuConfig({ ...bambuConfig, printerId: e.target.value })} className="form-input">
                  <option value="">Select printer</option>
                  {printers.map((printer) => (
                    <option key={printer._id} value={printer._id}>{printer.name}</option>
                  ))}
                </select>
                <input value={bambuConfig.ipAddress} onChange={(e) => setBambuConfig({ ...bambuConfig, ipAddress: e.target.value })} placeholder="Printer IP" className="form-input" />
                <input value={bambuConfig.serialNumber} onChange={(e) => setBambuConfig({ ...bambuConfig, serialNumber: e.target.value })} placeholder="Serial number" className="form-input" />
                <input type="password" value={bambuConfig.accessCode} onChange={(e) => setBambuConfig({ ...bambuConfig, accessCode: e.target.value })} placeholder="Access code" className="form-input" />
                <button onClick={saveBambuConfig} className="rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800">Save connection</button>
              </div>
              <DataTable headers={['Name', 'Inventory ID', 'Connection', 'Status', 'Progress', 'Actions']}>
                {printers.map((printer) => (
                  <tr key={printer._id} className="table-row">
                    <td className="table-cell font-semibold">{printer.name}</td>
                    <td className="table-cell">{printer.inventoryCode || printer.id}</td>
                    <td className="table-cell">
                      <span className="text-xs font-semibold text-slate-600">{printer.connection || 'Manual'}</span>
                    </td>
                    <td className="table-cell"><StatusPill status={printer.status} /></td>
                    <td className="table-cell">{printer.progress || 0}%</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        {printer.apiProvider === 'bambulabs-api' && (
                          <button onClick={() => syncPrinter(printer.id)} className="rounded-md bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 hover:bg-cyan-100">
                            Sync
                          </button>
                        )}
                        <DangerButton onClick={() => deletePrinter(printer._id)}>Delete</DangerButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <PanelTitle title="Bookings" caption="Approve, complete, or cancel active fabrication work." />
              <DataTable headers={['User', 'Printer', 'Material', 'Status', 'Cost', 'Date', 'Actions']}>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="table-row">
                    <td className="table-cell">{booking.user}</td>
                    <td className="table-cell">{booking.printer}</td>
                    <td className="table-cell">{booking.material}</td>
                    <td className="table-cell">
                      <select value={booking.status} onChange={(e) => updateBookingStatus(booking._id, e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                        <option>pending</option>
                        <option>confirmed</option>
                        <option>completed</option>
                        <option>cancelled</option>
                      </select>
                    </td>
                    <td className="table-cell font-semibold">INR {booking.quote?.totalCost || 0}</td>
                    <td className="table-cell">{booking.date}</td>
                    <td className="table-cell"><DangerButton onClick={() => deleteBooking(booking._id)}>Delete</DangerButton></td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <PanelTitle title="Users" caption="Control access for clients and operators." />
              <DataTable headers={['Name', 'Email', 'Role', 'Actions']}>
                {users.map((u) => (
                  <tr key={u._id} className="table-row">
                    <td className="table-cell font-semibold">{u.name}</td>
                    <td className="table-cell">{u.email}</td>
                    <td className="table-cell">
                      <select value={u.role} onChange={(e) => changeUserRole(u._id, e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                        <option>admin</option>
                        <option>client</option>
                      </select>
                    </td>
                    <td className="table-cell">
                      <DangerButton onClick={() => deleteUser(u._id)} disabled={u.email === 'admin@smartlab.com'}>Delete</DangerButton>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function PanelTitle({ title, caption }) {
  return (
    <div className="mb-5 border-b border-slate-200 pb-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{caption}</p>
    </div>
  );
}

function DataTable({ headers, children }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[760px] border-collapse bg-white text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }) {
  const tone = status === 'Available' ? 'bg-emerald-50 text-emerald-700' : status === 'Printing' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function DangerButton({ children, ...props }) {
  return (
    <button {...props} className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
      {children}
    </button>
  );
}
