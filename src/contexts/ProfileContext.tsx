import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { getMyProfile, type ProfileDetail } from '../lib/api';

export type UserTier = 'free' | 'premium' | 'ultimate';

type ProfileContextValue = {
  /** Full profile data from the server, null while loading or if unauthenticated */
  profile: ProfileDetail | null;
  /** Whether the initial profile fetch is still in-flight */
  loading: boolean;
  /** Resolved subscription tier */
  tier: UserTier;
  /** Whether the user has an admin role */
  isAdmin: boolean;
  /** Whether the user can access premium-gated features */
  canAccessPremium: boolean;
  /** Force re-fetch the profile (e.g. after updating profile fields) */
  refresh: () => void;
};

function resolveTier(profile: ProfileDetail | null): UserTier {
  const planName = profile?.subscriptions?.[0]?.plan?.name?.trim().toLowerCase();
  if (planName === 'ultimate') return 'ultimate';
  if (planName === 'premium') return 'premium';
  return 'free';
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Track the token that triggered the current fetch so we can ignore stale responses
  const tokenRef = useRef(accessToken);

  const fetchProfile = useCallback(
    (token: string | null) => {
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      tokenRef.current = token;

      getMyProfile(token)
        .then((data) => {
          // Only apply if the token hasn't changed since we started
          if (tokenRef.current === token && data) {
            setProfile(data);
          }
        })
        .catch(() => {
          if (tokenRef.current === token) {
            setProfile(null);
          }
        })
        .finally(() => {
          if (tokenRef.current === token) {
            setLoading(false);
          }
        });
    },
    [],
  );

  // Fetch when auth token changes
  useEffect(() => {
    fetchProfile(accessToken);
  }, [accessToken, fetchProfile]);

  const refresh = useCallback(() => {
    fetchProfile(accessToken);
  }, [accessToken, fetchProfile]);

  const value = useMemo<ProfileContextValue>(() => {
    const tier = resolveTier(profile);
    const activeSub = profile?.subscriptions?.[0];
    const isSubActive = activeSub?.status === 'active';
    return {
      profile,
      loading,
      tier,
      isAdmin: profile?.role === 'admin',
      canAccessPremium:
        isSubActive && (tier === 'premium' || tier === 'ultimate'),
      refresh,
    };
  }, [profile, loading, refresh]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (ctx == null)
    throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
