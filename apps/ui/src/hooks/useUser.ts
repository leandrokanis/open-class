"use client";

import { useState, useEffect } from "react";
import { getMe, type UserProfile } from "@/lib/auth";

interface UseUserResult {
  user: UserProfile | null;
  loading: boolean;
  refetch: () => void;
  clear: () => void;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  function fetch() {
    setLoading(true);
    getMe().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }

  function clear() {
    setUser(null);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  return { user, loading, refetch: fetch, clear };
}
