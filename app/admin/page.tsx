"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Shield, Users, Activity } from "lucide-react"
import { toast } from "sonner"

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    connectedUsers,
    removeConnectedUser,
  } = useAppStore()

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        setIsAdminLoggedIn(true)
        toast.success("Admin login successful")
      } else {
        toast.error("Invalid credentials")
      }
    } catch (error) {
      toast.error("Login failed")
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    setIsAdminLoggedIn(false)
    setUsername("")
    setPassword("")
    toast.success("Logged out successfully")
  }

  const handleForceLogout = (ip: string) => {
    removeConnectedUser(ip)
    toast.success(`Force logged out user from ${ip}`)
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const getTimeSinceActivity = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`
    return `${minutes}m ago`
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button 
              onClick={handleLogin} 
              disabled={isLoading || !username || !password}
              className="w-full"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectedUsers.filter(u => 
                new Date().getTime() - new Date(u.lastActivity).getTime() < 300000
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Users</CardTitle>
        </CardHeader>
        <CardContent>
          {connectedUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active users</p>
          ) : (
            <div className="space-y-4">
              {connectedUsers.map((user) => (
                <div
                  key={user.ip}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.ip}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {getTimeSinceActivity(user.lastActivity)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connected: {formatTime(user.connectedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {user.userAgent}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleForceLogout(user.ip)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Force Logout
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}