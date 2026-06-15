import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import ClientDashboard from './ClientDashboard';
import heroImage from './assets/hero.png';

const slots = [
  { time: '09:00 AM - 11:00 AM', status: 'Booked' },
  { time: '11:00 AM - 12:00 PM', status: 'Pending' },
  { time: '12:00 PM - 02:00 PM', status: 'Available' },
  { time: '02:00 PM - 04:00 PM', status: 'Available' },
  { time: '04:00 PM - 06:00 PM', status: 'Booked' },
  { time: '06:00 PM - 08:00 PM', status: 'Available' },
];

export default function SmartLabPortal() {
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [printers, setPrinters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [printerRes, materialRes, bookingRes] = await Promise.all([
          axios.get('http://localhost:5000/api/printers'),
          axios.get('http://localhost:5000/api/materials'),
          axios.get('http://localhost:5000/api/bookings'),
        ]);

        setPrinters(printerRes.data.printers || []);
        setMaterials(materialRes.data || []);
        setBookings(bookingRes.data || []);
      } catch (error) {
        console.warn('Dashboard data load failed:', error.message);
      }
    }

    loadDashboardData();
  }, []);

  const loginUser = async (event) => {
    event?.preventDefault();
    setLoginStatus('');

    if (!email || !password) {
      setLoginStatus('Enter your email and password to continue.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoginStatus('');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setLoginStatus(error.response?.data?.message || 'Login failed. Check your credentials and try again.');
    }
  };

  const registerUser = async (event) => {
    event.preventDefault();
    setLoginStatus('');

    if (!name || !email || !password) {
      setLoginStatus('Enter your name, email, and password to create an account.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      setAuthMode('login');
      setPassword('');
      setLoginStatus('Account created. Sign in to open your user dashboard.');
    } catch (error) {
      setLoginStatus(error.response?.data?.message || 'Unable to create account.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
    setEmail('');
    setPassword('');
    setName('');
    setLoginStatus('');
  };

  const dashboardMetrics = useMemo(() => {
    const completedPrints = bookings.filter((booking) => booking.status === 'completed').length;
    return [
      { label: 'Active machines', value: printers.length || 0 },
      { label: 'Materials tracked', value: materials.length || 0 },
      { label: 'Scheduled jobs', value: bookings.length || 0 },
      { label: 'Completed prints', value: completedPrints || 0 },
    ];
  }, [bookings, materials, printers]);

  if (user) {
    return user.role === 'admin' ? (
      <AdminDashboard user={user} onLogout={handleLogout} />
    ) : (
      <ClientDashboard user={user} token={token} onLogout={handleLogout} />
    );
  }

  const featuredPrinter = printers[0] || {
    name: 'Bambu Lab X1 Carbon',
    status: 'Available',
    progress: 0,
    eta: '-',
    nozzleTemp: '25C',
    bedTemp: '25C',
    user: 'Ready queue',
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-cyan-300">SL</span>
            <div>
              <p className="text-lg font-semibold leading-none">Smart Lab</p>
              <p className="text-xs text-slate-500">Fabrication command center</p>
            </div>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#fleet" className="hover:text-slate-950">Fleet</a>
            <a href="#booking" className="hover:text-slate-950">Booking</a>
            <a href="#materials" className="hover:text-slate-950">Materials</a>
          </nav>
          <a href="#login" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Login
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
            <div className="max-w-3xl">
              <p className="motion-rise inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800" style={{ '--motion-delay': '60ms' }}>
                Live lab scheduling, quoting, and printer monitoring
              </p>
              <h1 className="motion-rise mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl" style={{ '--motion-delay': '130ms' }}>
                Smart Lab & Fabrication Management System
              </h1>
              <p className="motion-rise mt-6 max-w-2xl text-lg leading-8 text-slate-600" style={{ '--motion-delay': '210ms' }}>
                One portal for clients to upload models and book print slots, and one admin console for materials,
                machines, users, and production approvals.
              </p>

              <div className="metric-sequence mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {dashboardMetrics.map((metric) => (
                  <div key={metric.label} className="motion-card rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-3xl font-semibold text-slate-950">{metric.value}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <form key={authMode} id="login" onSubmit={authMode === 'login' ? loginUser : registerUser} className="motion-rise rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-200 lg:order-2" style={{ '--motion-delay': '40ms' }}>
                <div className="grid grid-cols-2 rounded-lg bg-slate-900 p-1 text-sm">
                  <button type="button" onClick={() => { setAuthMode('login'); setLoginStatus(''); }} className={`rounded-md px-3 py-2 font-semibold ${authMode === 'login' ? 'bg-white text-slate-950' : 'text-slate-300'}`}>
                    Sign in
                  </button>
                  <button type="button" onClick={() => { setAuthMode('register'); setLoginStatus(''); }} className={`rounded-md px-3 py-2 font-semibold ${authMode === 'register' ? 'bg-white text-slate-950' : 'text-slate-300'}`}>
                    Create account
                  </button>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{authMode === 'login' ? 'Common login' : 'New user account'}</p>
                <h2 className="mt-3 text-2xl font-semibold">{authMode === 'login' ? 'Continue to your workspace' : 'Create your Smart Lab account'}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {authMode === 'login'
                    ? 'Use the same login for admin and user accounts. Your role opens the right dashboard.'
                    : 'New accounts are created as users and open the user dashboard after sign in.'}
                </p>

                {authMode === 'register' && (
                  <>
                    <label className="mt-6 block text-sm font-medium text-slate-200" htmlFor="name">Full name</label>
                    <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300" placeholder="Your name" />
                  </>
                )}

                <label className={`${authMode === 'register' ? 'mt-4' : 'mt-6'} block text-sm font-medium text-slate-200`} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                  placeholder="you@smartlab.com"
                />

                <label className="mt-4 block text-sm font-medium text-slate-200" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                  placeholder="Enter password"
                />

                {loginStatus && <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">{loginStatus}</p>}

                <button type="submit" className="mt-5 w-full rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">
                  {authMode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <div className="lab-scanner motion-rise overflow-hidden rounded-lg border border-slate-200 bg-slate-100 lg:order-1" style={{ '--motion-delay': '280ms' }}>
                <img src={heroImage} alt="Smart fabrication lab" className="h-64 w-full object-cover lg:h-full" />
              </div>
            </div>
          </div>
        </section>

        <section id="fleet" className="mx-auto grid max-w-7xl gap-5 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="motion-card rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Printer status</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{featuredPrinter.name}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['Status', featuredPrinter.status],
                ['Current user', featuredPrinter.user || 'Idle'],
                ['ETA', featuredPrinter.eta || '-'],
                ['Progress', `${featuredPrinter.progress || 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-2 font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${featuredPrinter.progress || 0}%` }} />
            </div>
          </div>

          <div id="booking" className="motion-card rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Today slots</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Booking board</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {slots.map((slot) => (
                <div key={slot.time} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{slot.time}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      slot.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : slot.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {slot.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Bambu Lab X1 Carbon</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="materials" className="mx-auto max-w-7xl px-5 pb-12">
          <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Material inventory</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Costing starts with stock accuracy.</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                Admins manage base pricing, color surcharges, stock tiers, and printer availability. Clients see the
                simplified flow: upload, quote, book.
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {(materials.length ? materials.slice(0, 3) : [{ name: 'PLA+', stock: 0, basePrice: 1200 }, { name: 'PETG', stock: 0, basePrice: 1800 }, { name: 'ABS', stock: 0, basePrice: 1600 }]).map((material) => (
                <div key={material._id || material.name} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                  <p className="text-xl font-semibold">{material.name}</p>
                  <p className="mt-3 text-sm text-slate-400">Stock: {material.stock ?? 0} kg</p>
                  <p className="mt-1 text-sm text-slate-400">Base: INR {material.basePrice ?? material.pricePerKg ?? 0}/kg</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        Smart Lab Infrastructure System 2026
      </footer>
    </div>
  );
}
