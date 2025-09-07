import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContextType, User, UserProfile } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          if (session?.user) {
            await loadUserData(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.id);

      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId);
      
      // Always get the current auth user first
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Error getting auth user:', authError);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!authUser) {
        console.log('No authenticated user found');
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Try to load user data from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      let finalUserData: User;

      if (userError) {
        console.error('Error loading user from database:', userError);
        
        // If user doesn't exist in users table, create minimal user object from auth data
        finalUserData = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || '',
          role: 'buyer'
        } as User;

        // Optionally, try to create the user record in the database
        try {
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || '',
              role: 'buyer',
            });

          if (createError) {
            console.error('Error creating user record:', createError);
          } else {
            console.log('Created missing user record');
          }
        } catch (createErr) {
          console.error('Failed to create user record:', createErr);
        }
      } else {
        finalUserData = userData;
      }

      setUser(finalUserData);

      // Load profile data (optional, don't fail if it doesn't exist)
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading profile:', profileError);
        } else {
          setProfile(profileData);
        }
      } catch (profileErr) {
        console.error('Profile loading failed:', profileErr);
        // Don't fail the entire process for profile errors
      }

    } catch (error) {
      console.error('Error in loadUserData:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // The auth state change handler will manage loading state
      return data;
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'buyer',
          });

        if (userError) {
          console.error('Error creating user record:', userError);
          // Don't throw error here - user is still authenticated
        }
      }

      return data;
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setProfile(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};