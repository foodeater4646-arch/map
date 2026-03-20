import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

/**
 * usePremium — Custom hook to check if the current user has premium status.
 * Returns { isPremium, isGuest, isLoggedIn, loading }
 */
export default function usePremium(session) {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = !!session;
    const isGuest = !session;

    useEffect(() => {
        if (!session?.user?.id) {
            setIsPremium(false);
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.warn('Could not fetch profile:', error.message);
                    setIsPremium(false);
                } else {
                    setIsPremium(data?.is_premium || false);
                }
            } catch (err) {
                console.error('Premium check failed:', err);
                setIsPremium(false);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [session?.user?.id]);

    return { isPremium, isGuest, isLoggedIn, loading };
}
