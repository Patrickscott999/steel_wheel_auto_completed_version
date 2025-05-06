"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, FileText, LogIn, LogOut, Lock, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { InvoiceForm } from "@/components/invoice-form"
import { LoginModal } from "@/components/login-modal"
import { InvoicePreview } from "@/components/invoice-preview"
import { auth, onAuthStateChange, logoutUser } from "@/lib/firebase"

export default function InvoiceGenerator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null)
  const [customerEmail, setCustomerEmail] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setIsLoggedIn(true)
        setUserEmail(user.email)
        // Check if user is admin or CEO
        setIsAdmin(user.email?.includes('admin') || user.email?.includes('ceo') || false)
      } else {
        setIsLoggedIn(false)
        setUserEmail(null)
        setIsAdmin(false)
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Firebase login is handled in the LoginModal component
    // This just closes the modal and shows a welcome message
    setShowLoginModal(false)
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      // Firebase auth state change will update isLoggedIn
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      })
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInvoiceGenerated = (data: any) => {
    setGeneratedInvoice(data)
    setCustomerEmail(data.customerEmail)
    toast({
      title: "Invoice Generated!",
      description: `Invoice successfully sent to ${data.customerEmail} and steelwheelauto@gmail.com.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a29] via-[#1a1a4a] to-[#0a0a29] text-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto pt-16 pb-8 px-4"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-purple-500 blur-xl opacity-20"></div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-300 to-purple-200 mb-4">
              Steel Wheel Auto Limited
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-blue-200 font-light tracking-wide"
          >
            Precision. Performance. Professionalism.
          </motion.p>

          {/* Login/Logout Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute top-8 right-8"
          >
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs px-2 py-1 rounded-full font-medium">
                    CEO
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-blue-200 hover:text-white hover:bg-blue-900/30"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoginModal(true)}
                className="text-blue-200 hover:text-white hover:bg-blue-900/30"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </motion.div>
        </div>

        {/* Main Content - Authentication Gate */}
        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-md mx-auto text-center pb-12"
          >
            <div className="bg-[#0c0c35]/60 border border-purple-500/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(123,104,238,0.15)] p-8 mb-8">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-blue-100 mb-2">Authentication Required</h2>
                  <p className="text-blue-300/70 mb-6">Please login to access the invoice generator.</p>
                  
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center gap-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    Login to Continue
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Invoice Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="bg-[#0c0c35]/60 border border-purple-500/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(123,104,238,0.15)]">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-100">
                    <FileText className="mr-2 h-6 w-6 text-purple-400" />
                    Create New Invoice
                  </h2>
                  <InvoiceForm onInvoiceGenerated={handleInvoiceGenerated} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Invoice Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {generatedInvoice ? (
                <Card className="bg-[#0c0c35]/60 border border-purple-500/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(123,104,238,0.15)]">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-100">
                      <Download className="mr-2 h-6 w-6 text-purple-400" />
                      Invoice Preview
                    </h2>
                    <InvoicePreview invoice={generatedInvoice} />

                    {/* Success Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30"
                    >
                      <p className="text-sm text-blue-100">
                        Invoice successfully sent to <span className="font-semibold">{customerEmail}</span> and{" "}
                        <span className="font-semibold">steelwheelauto@gmail.com</span>.
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#0c0c35]/60 border border-purple-500/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(123,104,238,0.15)] h-full flex items-center justify-center">
                  <CardContent className="p-6 text-center">
                    <div className="opacity-70 mb-4">
                      <FileText className="h-16 w-16 mx-auto text-purple-300/50" />
                    </div>
                    <h3 className="text-xl font-medium text-blue-200 mb-2">No Invoice Generated Yet</h3>
                    <p className="text-blue-300/70 text-sm">Fill out the form to generate an invoice preview</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center text-blue-300/50 text-sm"
        >
          <p>© {new Date().getFullYear()} Steel Wheel Auto Limited. All rights reserved.</p>
          <p className="mt-1">Kingston, Jamaica</p>
        </motion.div>
      </motion.div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
    </div>
  )
}
