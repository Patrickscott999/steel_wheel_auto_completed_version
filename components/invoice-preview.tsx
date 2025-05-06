"use client"

import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InvoicePreviewProps {
  invoice: {
    customerName: string
    customerAddress: string
    customerEmail: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    vehicleColor: string
    chassisNumber: string
    engineNumber: string
    amount: string
    date: string
  }
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const invoiceNumber = `SW-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("In a production app, this would download a PDF of the invoice")
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a20] border border-purple-500/20 rounded-xl p-5 shadow-inner">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-blue-100">INVOICE</h3>
            <p className="text-blue-300 text-sm">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200 font-medium">Steel Wheel Auto Limited</p>
            <p className="text-xs text-blue-300/70">Kingston, Jamaica</p>
            <p className="text-xs text-blue-300/70">steelwheelauto@gmail.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-blue-300/70 mb-1">Bill To:</p>
            <p className="text-sm text-blue-200 font-medium">{invoice.customerName}</p>
            <p className="text-xs text-blue-300/70">{invoice.customerAddress}</p>
            <p className="text-xs text-blue-300/70">{invoice.customerEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-300/70 mb-1">Date:</p>
            <p className="text-sm text-blue-200">{invoice.date}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-[#0c0c35] rounded-lg p-3 mb-3">
            <h4 className="text-sm font-medium text-blue-200 mb-2">Vehicle Details</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className="text-blue-300/70">Make:</span>{" "}
                <span className="text-blue-100">{invoice.vehicleMake}</span>
              </div>
              <div>
                <span className="text-blue-300/70">Model:</span>{" "}
                <span className="text-blue-100">{invoice.vehicleModel}</span>
              </div>
              <div>
                <span className="text-blue-300/70">Year:</span>{" "}
                <span className="text-blue-100">{invoice.vehicleYear}</span>
              </div>
              <div>
                <span className="text-blue-300/70">Color:</span>{" "}
                <span className="text-blue-100">{invoice.vehicleColor}</span>
              </div>
              <div>
                <span className="text-blue-300/70">Chassis #:</span>{" "}
                <span className="text-blue-100">{invoice.chassisNumber}</span>
              </div>
              <div>
                <span className="text-blue-300/70">Engine #:</span>{" "}
                <span className="text-blue-100">{invoice.engineNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-500/20 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-200">Total Amount:</span>
            <span className="text-lg font-bold text-blue-100">
              JMD $
              {Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(123,104,238,0.3)] hover:shadow-[0_6px_30px_rgba(123,104,238,0.4)]"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Invoice PDF
        </Button>
      </motion.div>
    </div>
  )
}
