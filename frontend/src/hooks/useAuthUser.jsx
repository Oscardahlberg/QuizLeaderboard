import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export function useAuthUser() {
  const [user, setUser] = useState(null);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return user
}

export async function logoutAuthUser() {
  try {
    const { error } = await supabase.auth.signOut();
  } catch (err) {
    console.error('Logout error:', err);
  }
}
