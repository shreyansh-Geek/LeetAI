import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return; // wait until localStorage is loaded

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [token, hydrated, pathname, router]);

  return {
    token,
    user,
    hydrated,
    isAuthenticated: !!token,
  };
}