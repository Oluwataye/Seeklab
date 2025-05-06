"use client"

import type React from "react"

import { useState } from "react"
import { Settings, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToastContext } from "@/components/toast-provider"

export default function SettingsPage() {
  const { toast } = useToastContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "OSOFT",
    systemEmail: "system@osoft.com",
    dateFormat: "dd-mm-yyyy",
    timeFormat: "24h",
    autoBackup: true,
    emailNotifications: true,
    maintenanceMode: false,
    defaultCurrency: "ngn",
    sessionTimeout: "30",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Settings Saved", "Your settings have been updated successfully")
    }, 1000)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          System Settings
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" /> Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium border-b pb-2">General Settings</h2>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" value={formData.companyName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemEmail">System Email</Label>
              <Input id="systemEmail" type="email" value={formData.systemEmail} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={formData.dateFormat} onValueChange={(value) => handleSelectChange("dateFormat", value)}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={formData.timeFormat} onValueChange={(value) => handleSelectChange("timeFormat", value)}>
                <SelectTrigger id="timeFormat">
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium border-b pb-2">System Preferences</h2>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoBackup">Automatic Backup</Label>
              <Switch
                id="autoBackup"
                checked={formData.autoBackup}
                onCheckedChange={(checked) => handleSwitchChange("autoBackup", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => handleSwitchChange("maintenanceMode", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select
                value={formData.defaultCurrency}
                onValueChange={(value) => handleSelectChange("defaultCurrency", value)}
              >
                <SelectTrigger id="defaultCurrency">
                  <SelectValue placeholder="Select default currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngn">Nigerian Naira (NGN)</SelectItem>
                  <SelectItem value="usd">US Dollar (USD)</SelectItem>
                  <SelectItem value="eur">Euro (EUR)</SelectItem>
                  <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input id="sessionTimeout" type="number" value={formData.sessionTimeout} onChange={handleInputChange} />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
