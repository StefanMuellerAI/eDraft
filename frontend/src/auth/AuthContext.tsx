/**
 * Auth-Naht (§9, NFA-7): Im MVP ein No-Op — jeder Aufrufer ist „anonym,
 * erlaubt". Bei der späteren SSO-Anbindung (OIDC oder SAML/Shibboleth/
 * DFN-AAI) wird ausschließlich der Provider ausgetauscht; alle Komponenten
 * konsumieren weiterhin nur `useAuth()`.
 */

import { createContext, useContext, type ReactNode } from 'react'

export type UserRole = 'student' | 'lecturer' | 'admin'

export interface AuthUser {
  /** Entspricht später `external_idp_subject` aus dem SSO (§11). */
  id: string
  displayName: string
  role: UserRole
}

export interface AuthState {
  /** Im MVP immer `false` — es gibt keine Anmeldung. */
  isAuthenticated: boolean
  /** Im MVP immer `null` (anonym). */
  user: AuthUser | null
  /** Im MVP immer `true`: jeder darf den Editor nutzen. */
  canUseEditor: boolean
}

const ANONYMOUS_AUTH: AuthState = {
  isAuthenticated: false,
  user: null,
  canUseEditor: true,
}

const AuthContext = createContext<AuthState>(ANONYMOUS_AUTH)

export function AuthProvider({ children }: { children: ReactNode }) {
  // MVP: statischer anonymer Zustand. Später: Token-Handling, Login-Redirect,
  // Session-Refresh — gekapselt in diesem Provider.
  return <AuthContext.Provider value={ANONYMOUS_AUTH}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
