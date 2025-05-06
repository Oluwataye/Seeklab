"use client"

import type React from "react"

import { useState } from "react"
import { Building, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToastContext } from "@/components/toast-provider"

// Initial company data
const initialCompanyData = {
  name: "OSOFT",
  registrationNumber: "RC: 998237",
  taxId: "TAX12345678",
  industry: "Information Technology",
  website: "https://www.osoft.com",
  email: "info@osoft.com",
  phone: "+234 123 456 7890",
  address: "123 Main Street, Lagos, Nigeria",
  city: "Lagos",
  state: "Lagos State",
  postalCode: "100001",
  country: "Nigeria",
}

export default function CompanyPage() {
  const { toast } = useToastContext()
  const [companyData, setCompanyData] = useState(initialCompanyData)
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Validate required fields
    if (!companyData.name || !companyData.email) {
      toast.error("Validation Error", "Company name and email are required")
      return
    }

    // In a real app, this would be an API call to save the data
    // For now, we'll just show a success message
    toast.success("Changes Saved", "Company information has been updated successfully")
    setIsEditing(false)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Company Information
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" /> Save Changes
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium border-b pb-2">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" name="name" value={companyData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={companyData.registrationNumber}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input id="taxId" name="taxId" value={companyData.taxId} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" value={companyData.industry} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" value={companyData.website} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium border-b pb-2">Contact Information</h2>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={companyData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={companyData.phone} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={companyData.address} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={companyData.city} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={companyData.state} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" value={companyData.postalCode} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={companyData.country} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
