"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginWithEmail } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Call Firebase authentication
      const user = await loginWithEmail(email, password)
      
      // If login is successful, call the onLogin callback
      onLogin(email, password)
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.email}`,
      })
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle common Firebase auth errors
      let errorMessage = 'Failed to login. Please check your credentials.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0c0c35] to-[#0a0a29] border border-purple-500/20 shadow-[0_0_30px_rgba(123,104,238,0.2)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-blue-300 hover:text-white hover:bg-blue-900/30"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-100">Login</h2>
              <p className="text-blue-300/70 text-sm mt-1">Access your Steel Wheel Auto account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                />
              </div>

              <div className="text-right">
                <a href="#" className="text-xs text-blue-300 hover:text-blue-200">
                  Forgot password?
                </a>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-200 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-blue-300/70">
                For demo purposes, any email/password will work.
                <br />
                Use "admin@example.com" for CEO access.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
