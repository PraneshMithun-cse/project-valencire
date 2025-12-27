import React, { useState, useEffect } from 'react';
import { User, Package, Activity, Clock, MapPin, CreditCard, LogOut, Eye, EyeOff } from 'lucide-react';

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

  useEffect(() => {
    const storedUsers = localStorage.getItem('valencire_users');
    const storedSession = localStorage.getItem('valencire_session');
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    
    if (storedSession) {
      const session = JSON.parse(storedSession);
      setCurrentUser(session.email);
      window.location.href = "/index.html";
    }
  }, []);

  const saveUsers = (updatedUsers) => {
    localStorage.setItem('valencire_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const createSession = (email) => {
    localStorage.setItem('valencire_session', JSON.stringify({
      email,
      loginTime: new Date().toISOString()
    }));
    setCurrentUser(email);
  };

  const handleSignup = (e) => {
    e?.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters!');
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
      orders: [],
      addresses: [],
      activities: [
        {
          id: 1,
          type: 'account_created',
          description: 'Account created',
          timestamp: new Date().toISOString()
        }
      ],
      preferences: {
        notifications: true,
        newsletter: false
      }
    };

    const updatedUsers = { ...users, [formData.email]: newUser };
    saveUsers(updatedUsers);
    createSession(formData.email);
    window.location.href = "/index.html";
    
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleSignin = (e) => {
    e?.preventDefault();
    setError('');

    const user = users[formData.email];
    
    if (!user) {
      setError('Account not found. Please create an account.');
      return;
    }

    if (user.password !== formData.password) {
      setError('Incorrect password!');
      return;
    }

    const updatedUser = {
      ...user,
      activities: [
        {
          id: Date.now(),
          type: 'login',
          description: 'Signed in to account',
          timestamp: new Date().toISOString()
        },
        ...user.activities
      ]
    };

    const updatedUsers = { ...users, [formData.email]: updatedUser };
    saveUsers(updatedUsers);
    createSession(formData.email);
    window.location.href = "/index.html";
    
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleLogout = () => {
    if (currentUser) {
      const user = users[currentUser];
      const updatedUser = {
        ...user,
        activities: [
          {
            id: Date.now(),
            type: 'logout',
            description: 'Signed out of account',
            timestamp: new Date().toISOString()
          },
          ...user.activities
        ]
      };
      
      const updatedUsers = { ...users, [currentUser]: updatedUser };
      saveUsers(updatedUsers);
    }

    localStorage.removeItem('valencire_session');
    setCurrentUser(null);
    setView('landing');
  };

  const addSampleOrder = () => {
    if (!currentUser) return;

    const user = users[currentUser];
    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      items: [
        {
          name: 'AMETHYST NOIR™',
          size: 'M',
          quantity: 1,
          price: 1800
        }
      ],
      total: 1800,
      status: 'Processing',
      shippingAddress: '123 Fashion Street, Mumbai, MH 400001'
    };

    const updatedUser = {
      ...user,
      orders: [newOrder, ...user.orders],
      activities: [
        {
          id: Date.now(),
          type: 'order_placed',
          description: `Order placed - ${newOrder.id}`,
          timestamp: new Date().toISOString()
        },
        ...user.activities
      ]
    };

    const updatedUsers = { ...users, [currentUser]: updatedUser };
    saveUsers(updatedUsers);
  };

  const getUserData = () => {
    return currentUser ? users[currentUser] : null;
  };

  const userData = getUserData();

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-light tracking-[0.2em] mb-4">VALENCIRÈ®</h1>
            <p className="text-sm tracking-widest opacity-60">CRAFTED FOR THE EXTRAORDINARY</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setView('signin')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full font-semibold tracking-widest text-sm hover:from-purple-500 hover:to-purple-600 transition-all hover:scale-105"
            >
              SIGN IN
            </button>
            
            <button
              onClick={() => setView('signup')}
              className="w-full py-4 bg-white/5 border border-white/20 rounded-full font-semibold tracking-widest text-sm hover:bg-white/10 transition-all"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light tracking-[0.3em] mb-2">SIGN IN</h2>
            <p className="text-xs tracking-widest opacity-50">WELCOME BACK</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleSignin()}
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 outline-none transition-all"
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSignin()}
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleSignin}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full font-semibold tracking-widest text-sm hover:from-purple-500 hover:to-purple-600 transition-all hover:scale-105 mt-6"
            >
              LOGIN
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs tracking-wider opacity-60">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setView('signup');
                  setError('');
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Create Account
              </button>
            </p>
          </div>

          <button
            onClick={() => setView('landing')}
            className="mt-6 text-xs tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light tracking-[0.3em] mb-2">CREATE ACCOUNT</h2>
            <p className="text-xs tracking-widest opacity-50">JOIN VALENCIRÈ</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="FIRST NAME"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="px-4 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 outline-none transition-all text-sm"
              />
              
              <input
                type="text"
                placeholder="LAST NAME"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="px-4 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 outline-none transition-all text-sm"
              />
            </div>

            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 outline-none transition-all"
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <input
              type="password"
              placeholder="CONFIRM PASSWORD"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 outline-none transition-all"
            />

            <button
              onClick={handleSignup}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full font-semibold tracking-widest text-sm hover:from-purple-500 hover:to-purple-600 transition-all hover:scale-105 mt-6"
            >
              CREATE ACCOUNT
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs tracking-wider opacity-60">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setView('signin');
                  setError('');
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>

          <button
            onClick={() => setView('landing')}
            className="mt-6 text-xs tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  if (view === 'dashboard' && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-gray-950 text-white">
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-light tracking-[0.3em]">VALENCIRÈ®</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 hover:bg-red-500/30 transition-all text-sm"
            >
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold">
                  {userData.firstName[0]}{userData.lastName[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-light tracking-wider mb-2">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <p className="text-white/60 text-sm tracking-wide">{userData.email}</p>
                  <p className="text-white/40 text-xs tracking-wide mt-1">
                    Member since {formatDate(userData.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <Package className="text-purple-400" size={24} />
                <h3 className="text-lg tracking-wider">Total Orders</h3>
              </div>
              <p className="text-4xl font-light">{userData.orders.length}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <Activity className="text-blue-400" size={24} />
                <h3 className="text-lg tracking-wider">Activities</h3>
              </div>
              <p className="text-4xl font-light">{userData.activities.length}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <MapPin className="text-green-400" size={24} />
                <h3 className="text-lg tracking-wider">Addresses</h3>
              </div>
              <p className="text-4xl font-light">{userData.addresses.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl tracking-widest flex items-center gap-3">
                  <Package size={24} className="text-purple-400" />
                  ORDER HISTORY
                </h3>
                <button
                  onClick={addSampleOrder}
                  className="text-xs px-4 py-2 bg-purple-600/20 border border-purple-600/30 rounded-full hover:bg-purple-600/30 transition-all tracking-wider"
                >
                  + ADD SAMPLE
                </button>
              </div>

              {userData.orders.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm tracking-wide">No orders yet</p>
                  <p className="text-xs mt-2 opacity-70">Your order history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {userData.orders.map((order) => (
                    <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold tracking-wide">{order.id}</p>
                          <p className="text-xs text-white/50 mt-1">{formatDate(order.date)}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm flex justify-between">
                            <span className="text-white/70">{item.name} × {item.quantity}</span>
                            <span>₹{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-white/50">Total</span>
                        <span className="text-lg font-semibold">₹{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl tracking-widest mb-6 flex items-center gap-3">
                <Clock size={24} className="text-blue-400" />
                RECENT ACTIVITY
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {userData.activities.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="flex gap-4 pb-4 border-b border-white/5 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90">{activity.description}</p>
                      <p className="text-xs text-white/40 mt-1">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
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