import { useAuth } from '../context/AuthContext';

/** Convenience re-export so components import from hooks/ */
export function useAuthHook() {
  return useAuth();
}

export { useAuth };
