import { useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

import { useUser } from '../hooks/useUser';
import { useStore } from '../store/store';
import { supabase } from '../utils/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, user, session } = useUser();

  useEffect(() => {
    console.log('[Auth State]', { isAuthenticated, user, session });
  }, [isAuthenticated, user, session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Initial Session]', session);
      useStore.setState({ session, user: session?.user ?? null });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth Change]', { event: _event, session });
      useStore.setState({ session, user: session?.user ?? null });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(protected)';

    console.log('[Navigation]', {
      inAuthGroup,
      inProtectedGroup,
      isAuthenticated,
    });

    if (!isAuthenticated && inProtectedGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(protected)/notes');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}
