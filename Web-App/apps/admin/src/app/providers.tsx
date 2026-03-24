"use client"

import { AuthProvider } from "../../components/shared/auth-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
