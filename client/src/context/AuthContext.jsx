import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase profiles table
  const fetchProfile = async (userId) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching profile from Supabase:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('fetchProfile exception:', err);
      return null;
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Check active Supabase session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(prof || {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            email: session.user.email,
            role: session.user.user_metadata?.role || 'customer'
          });
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            const prof = await fetchProfile(session.user.id);
            setProfile(prof || {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email.split('@')[0],
              email: session.user.email,
              role: session.user.user_metadata?.role || 'customer'
            });
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Mock / Offline Demo Mode initialization
      const savedUser = localStorage.getItem('bookstore_demo_current_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setProfile(parsed);
        } catch {
          localStorage.removeItem('bookstore_demo_current_user');
        }
      }
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const prof = await fetchProfile(data.user.id);
      setUser(data.user);
      setProfile(prof || {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
        email: data.user.email,
        role: data.user.user_metadata?.role || 'customer'
      });
      return { user: data.user, profile: prof };
    } else {
      // Demo / Mock Mode login
      let role = 'customer';
      let name = email.split('@')[0];

      if (email.toLowerCase().includes('admin')) {
        role = 'admin';
        name = 'Admin User';
      } else if (email.toLowerCase().includes('customer') || email.toLowerCase().includes('rahul')) {
        name = 'Rahul Sharma';
      }

      const mockUserData = {
        id: role === 'admin' ? 'usr-demo-admin-1' : 'usr-demo-customer-1',
        name,
        email,
        role,
        created_at: new Date().toISOString()
      };

      localStorage.setItem('bookstore_demo_current_user', JSON.stringify(mockUserData));
      setUser(mockUserData);
      setProfile(mockUserData);
      return { user: mockUserData, profile: mockUserData };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'customer',
          },
        },
      });
      if (error) throw error;
      return data;
    } else {
      // Demo / Mock Mode register
      const newMockUser = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: 'customer',
        created_at: new Date().toISOString()
      };

      // Add to mock customers list
      try {
        const storedCustomers = JSON.parse(localStorage.getItem('bookstore_demo_customers') || '[]');
        if (storedCustomers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email is already registered');
        }
        storedCustomers.push(newMockUser);
        localStorage.setItem('bookstore_demo_customers', JSON.stringify(storedCustomers));
      } catch (err) {
        if (err.message.includes('already registered')) throw err;
      }

      localStorage.setItem('bookstore_demo_current_user', JSON.stringify(newMockUser));
      setUser(newMockUser);
      setProfile(newMockUser);
      return { user: newMockUser, profile: newMockUser };
    }
  };

  // Logout handler
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('bookstore_demo_current_user');
    }
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    role: profile?.role || 'guest',
    isAdmin,
    loading,
    login,
    register,
    logout,
    isSupabaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
