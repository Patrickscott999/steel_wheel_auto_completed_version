"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowRight, Calendar, Car, DollarSign, User } from "lucide-react"
import { createInvoice } from "@/lib/api/invoiceService"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  customerName: z.string().min(2, { message: "Name is required" }),
  customerAddress: z.string().min(5, { message: "Address is required" }),
  customerEmail: z.string().email({ message: "Valid email is required" }),
  vehicleMake: z.string().min(1, { message: "Vehicle make is required" }),
  vehicleModel: z.string().min(1, { message: "Vehicle model is required" }),
  vehicleYear: z.string().regex(/^\d{4}$/, { message: "Valid year is required (YYYY)" }),
  vehicleColor: z.string().min(1, { message: "Vehicle color is required" }),
  chassisNumber: z.string().min(5, { message: "Chassis number is required" }),
  engineNumber: z.string().min(5, { message: "Engine number is required" }),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Valid amount is required" }),
})

type InvoiceFormValues = z.infer<typeof formSchema>

interface InvoiceFormProps {
  onInvoiceGenerated: (data: InvoiceFormValues & { date: string }) => void
}

export function InvoiceForm({ onInvoiceGenerated }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerAddress: "",
      customerEmail: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      chassisNumber: "",
      engineNumber: "",
      amount: "",
    },
  })

  async function onSubmit(data: InvoiceFormValues) {
    setIsSubmitting(true)
    
    try {
      // Call the real backend API
      const response = await createInvoice(data);
      
      // Format the date for display
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      
      // Notify parent component of successful invoice generation
      onInvoiceGenerated({
        ...data,
        date: currentDate,
      })
      
      toast({
        title: "Invoice Generated Successfully",
        description: `Invoice has been sent to ${data.customerEmail}.`,
        variant: "default",
      })
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to generate invoice. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-200 mb-2">
            <User className="h-4 w-4" />
            <h3 className="font-medium">Customer Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="customer@example.com"
                      type="email"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customerAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St, Kingston, Jamaica"
                    {...field}
                    className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-purple-500/20" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-200 mb-2">
            <Car className="h-4 w-4" />
            <h3 className="font-medium">Vehicle Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="vehicleMake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Make</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Toyota"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Model</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Corolla"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Year</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2023"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="vehicleColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Color</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Silver"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chassisNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Chassis Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="JT2AE09V1P0054321"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="engineNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Engine Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2AZ-1234567"
                      {...field}
                      className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="bg-purple-500/20" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-200 mb-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="font-medium">Payment Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Amount (JMD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-blue-300">$</span>
                      <Input
                        placeholder="15000.00"
                        {...field}
                        className="bg-[#0a0a2e] border-purple-500/30 focus:border-purple-400 text-white pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-blue-200">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-blue-300" />
                <Input
                  value={new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  disabled
                  className="bg-[#0a0a2e] border-purple-500/30 text-white pl-8"
                />
              </div>
            </div>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(123,104,238,0.3)] hover:shadow-[0_6px_30px_rgba(123,104,238,0.4)]"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                Generate Invoice
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  )
}
