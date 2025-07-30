import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface RouteStep {
  type: "left" | "right" | "straight" | "u-turn" | "pick" | "drop"
  id: string
}

export interface ConfigData {
  sensor: number
  stop: number
  turn: number
  referent_line_width: number
}

export interface ConnectedUser {
  ip: string
  userAgent: string
  connectedAt: Date
  lastActivity: Date
}

export interface AdminState {
  isAdminLoggedIn: boolean
  connectedUsers: ConnectedUser[]
}

interface AppState {
  wsIp: string
  setWsIp: (ip: string) => void

  routeSteps: RouteStep[]
  addRouteStep: (step: Omit<RouteStep, "id">) => void
  removeLastStep: () => void
  removeStepById: (id: string) => void
  clearRoute: () => void

  config: ConfigData
  setConfig: (config: ConfigData) => void
  currentConfig: ConfigData
  setCurrentConfig: (config: ConfigData) => void

  websocket: WebSocket | null
  setWebsocket: (ws: WebSocket | null) => void

  isConnected: boolean
  setIsConnected: (connected: boolean) => void

  isRouteExpanded: boolean
  setIsRouteExpanded: (expanded: boolean) => void

  isUIHidden: boolean
  setIsUIHidden: (hidden: boolean) => void

  stickGap: number
  setStickGap: (gap: number) => void

  // Admin functionality
  isAdminLoggedIn: boolean
  setIsAdminLoggedIn: (loggedIn: boolean) => void
  connectedUsers: ConnectedUser[]
  addConnectedUser: (user: ConnectedUser) => void
  removeConnectedUser: (ip: string) => void
  updateUserActivity: (ip: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      wsIp: "",
      setWsIp: (ip) => set({ wsIp: ip }),

      routeSteps: [],
      addRouteStep: (step) =>
        set((state) => ({
          routeSteps: [...state.routeSteps, { ...step, id: Date.now().toString() }],
        })),
      removeLastStep: () =>
        set((state) => ({
          routeSteps: state.routeSteps.slice(0, -1),
        })),
      removeStepById: (id) =>
        set((state) => ({
          routeSteps: state.routeSteps.filter((step) => step.id !== id),
        })),
      clearRoute: () => set({ routeSteps: [] }),

      config: { sensor: 0, stop: 0, turn: 0, referent_line_width: 0 },
      setConfig: (config) => set({ config }),
      currentConfig: { sensor: 0, stop: 0, turn: 0, referent_line_width: 0 },
      setCurrentConfig: (config) => set({ currentConfig: config }),

      websocket: null,
      setWebsocket: (ws) => set({ websocket: ws }),

      isConnected: false,
      setIsConnected: (connected) => set({ isConnected: connected }),

      isRouteExpanded: false,
      setIsRouteExpanded: (expanded) => set({ isRouteExpanded: expanded }),

      isUIHidden: false,
      setIsUIHidden: (hidden) => set({ isUIHidden: hidden }),

      stickGap: 12,
      setStickGap: (gap) => set({ stickGap: gap }),

      // Admin functionality
      isAdminLoggedIn: false,
      setIsAdminLoggedIn: (loggedIn) => set({ isAdminLoggedIn: loggedIn }),
      connectedUsers: [],
      addConnectedUser: (user) =>
        set((state) => ({
          connectedUsers: [...state.connectedUsers.filter(u => u.ip !== user.ip), user],
        })),
      removeConnectedUser: (ip) =>
        set((state) => ({
          connectedUsers: state.connectedUsers.filter(user => user.ip !== ip),
        })),
      updateUserActivity: (ip) =>
        set((state) => ({
          connectedUsers: state.connectedUsers.map(user =>
            user.ip === ip ? { ...user, lastActivity: new Date() } : user
          ),
        })),
    }),
    {
      name: "websocket-app-storage",
      partialize: (state) => ({
        wsIp: state.wsIp,
        config: state.config,
        stickGap: state.stickGap,
      }),
    },
  ),
)
