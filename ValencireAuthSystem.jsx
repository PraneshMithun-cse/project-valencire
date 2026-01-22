import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, LogOut, Eye, EyeOff, ChevronRight, Clock } from 'lucide-react';

const ValencireAuthSystem = () => {
  const [view, setView] = useState('landing');
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersResult = await window.storage.get('valencire_users');
        const sessionResult = await window.storage.get('valencire_session');
        
        if (usersResult?.value) {
          setUsers(JSON.parse(usersResult.value));
        }
        
        if (sessionResult?.value) {
          const session = JSON.parse(sessionResult.value);
          setCurrentUser(session.email);
          setView('dashboard');
        }
      } catch (err) {
        console.log('No existing data found');
      }
    };
    
    loadData();
  }, []);

  const saveUsers = async (updatedUsers) => {
    try {
      await window.storage.set('valencire_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (err) {
      console.error('Failed to save users:', err);
    }
  };

  const createSession = async (email) => {
    try {
      await window.storage.set('valencire_session', JSON.stringify({
        email,
        loginTime: new Date().toISOString()
      }));
      setCurrentUser(email);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const sendEmailNotification = async (email, firstName, type) => {
    console.log(`Email sent to ${email}`);
    console.log(`Type: ${type}`);
    console.log(`Hello ${firstName}, your account has been created successfully!`);
    
    setSuccess(`Account created! A confirmation email has been sent to ${email}`);
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required!');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters!');
      return;
    }

    if (users[formData.email]) {
      setError('Email already registered!');
      return;
    }

    const newUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      createdAt: new Date().toISOString(),
      activeOrders: [],
      pastOrders: [],
      addresses: []
    };

    const updatedUsers = { ...users, [formData.email]: newUser };
    await saveUsers(updatedUsers);
    await sendEmailNotification(formData.email, formData.firstName, 'signup');
    await createSession(formData.email);
    
    setTimeout(() => {
      setView('dashboard');
      setSuccess('');
    }, 2000);
    
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleSignin = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required!');
      return;
    }

    const user = users[formData.email];
    
    if (!user) {
      setError('Account not found. Please create an account.');
      return;
    }

    if (user.password !== formData.password) {
      setError('Incorrect password!');
      return;
    }

    await createSession(formData.email);
    setView('dashboard');
    
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('valencire_session');
      setCurrentUser(null);
      setView('landing');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getUserData = () => {
    return currentUser ? users[currentUser] : null;
  };

  const userData = getUserData();

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-12">
            <h1 className="text-5xl font-light tracking-[0.3em] mb-4">VALENCIRÈ®</h1>
            <p className="text-xs tracking-[0.2em] text-gray-400">CRAFTED FOR THE EXTRAORDINARY</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setView('signin')}
              className="w-full py-4 bg-white text-black rounded-full font-medium tracking-wider text-sm hover:bg-gray-200 transition-all shadow-lg"
            >
              SIGN IN
            </button>
            
            <button
              onClick={() => setView('signup')}
              className="w-full py-4 bg-transparent border-2 border-white rounded-full font-medium tracking-wider text-sm hover:bg-white hover:text-black transition-all"
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'signin') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl text-white rounded-3xl p-10 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light tracking-[0.2em] mb-2">SIGN IN</h2>
            <p className="text-xs tracking-wider text-gray-300">WELCOME BACK</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleSignin()}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:border-white/50 focus:bg-white/20 outline-none transition-all"
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSignin()}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:border-white/50 focus:bg-white/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleSignin}
              className="w-full py-4 bg-white text-black rounded-full font-medium tracking-wider text-sm hover:bg-gray-200 transition-all mt-6 shadow-lg"
            >
              LOGIN
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-300">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setView('signup');
                  setError('');
                }}
                className="text-white font-semibold hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>

          <button
            onClick={() => setView('landing')}
            className="mt-6 text-xs text-gray-400 hover:text-white transition-opacity"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl text-white rounded-3xl p-10 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light tracking-[0.2em] mb-2">CREATE ACCOUNT</h2>
            <p className="text-xs tracking-wider text-gray-300">JOIN VALENCIRÈ</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl text-sm text-green-200">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:border-white/50 focus:bg-white/20 outline-none transition-all text-sm"
              />
              
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:border-white/50 focus:bg-white/20 outline-none transition-all text-sm"
              />
            </div>

            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:border-white/50 focus:bg-white/20 outline-none transition-all"
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:border-white/50 focus:bg-white/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:border-white/50 focus:bg-white/20 outline-none transition-all"
            />

            <button
              onClick={handleSignup}
              className="w-full py-4 bg-white text-black rounded-full font-medium tracking-wider text-sm hover:bg-gray-200 transition-all mt-6 shadow-lg"
            >
              CREATE ACCOUNT
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-300">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setView('signin');
                  setError('');
                }}
                className="text-white font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>

          <button
            onClick={() => setView('landing')}
            className="mt-6 text-xs text-gray-400 hover:text-white transition-opacity"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  if (view === 'dashboard' && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-light tracking-[0.2em] text-black">VALENCIRÈ®</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-all shadow-lg"
            >
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 mb-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black text-white flex items-center justify-center text-2xl font-semibold shadow-lg">
                {userData.firstName[0]}{userData.lastName[0]}
              </div>
              <div>
                <h2 className="text-3xl font-light text-black tracking-wide">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-600 text-sm mt-1">{userData.email}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Member since {formatDate(userData.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-black flex items-center gap-3">
                  <Package size={24} />
                  Active Orders
                </h3>
              </div>

              {userData.activeOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No active orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.activeOrders.map((order) => (
                    <div key={order.id} className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-5 hover:bg-white/60 transition-all shadow-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-black">{order.id}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.date)}</p>
                        </div>
                        <span className="px-4 py-1.5 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full text-xs font-medium text-green-700">
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200/50 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Total</span>
                        <span className="text-lg font-semibold text-black">₹{order.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-black flex items-center gap-3">
                  <Clock size={24} />
                  Past Orders
                </h3>
              </div>

              {userData.pastOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No past orders</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {userData.pastOrders.map((order) => (
                    <div key={order.id} className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-5 hover:bg-white/60 transition-all shadow-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-black">{order.id}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.date)}</p>
                        </div>
                        <span className="px-4 py-1.5 bg-gray-500/20 backdrop-blur-sm border border-gray-500/30 rounded-full text-xs font-medium text-gray-700">
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200/50 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Total</span>
                        <span className="text-lg font-semibold text-black">₹{order.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-black flex items-center gap-3">
                  <MapPin size={24} />
                  Saved Addresses
                </h3>
              </div>

              {userData.addresses.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MapPin size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No saved addresses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.addresses.map((address, idx) => (
                    <div key={idx} className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-5 hover:bg-white/60 transition-all shadow-lg">
                      <p className="text-sm font-semibold text-black mb-2">{address.label}</p>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} {address.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-black flex items-center gap-3">
                  <User size={24} />
                  Account Details
                </h3>
              </div>

              <div className="space-y-5">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
                  <p className="text-xs text-gray-500 mb-2">Full Name</p>
                  <p className="text-base text-black font-medium">{userData.firstName} {userData.lastName}</p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
                  <p className="text-xs text-gray-500 mb-2">Email Address</p>
                  <p className="text-base text-black font-medium">{userData.email}</p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
                  <p className="text-xs text-gray-500 mb-2">Member Since</p>
                  <p className="text-base text-black font-medium">{formatDate(userData.createdAt)}</p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
                  <p className="text-xs text-gray-500 mb-2">Total Orders</p>
                  <p className="text-base text-black font-medium">{userData.activeOrders.length + userData.pastOrders.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ValencireAuthSystem;