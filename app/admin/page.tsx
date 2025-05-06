"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Settings,
  FileText,
  Phone,
  DollarSign,
  Package,
  CreditCard,
  FileSpreadsheet,
  PenToolIcon as Tool,
  BarChart2,
  Store,
  ShoppingCart,
  CalendarIcon,
  Home,
  LayoutGrid,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UserDropdown from "@/components/user-dropdown"
import { getUser } from "@/lib/auth"
import { useToastContext } from "@/components/toast-provider"

// Mock locations data
const mockLocations = [
  { id: "head-office", name: "Head Office" },
  { id: "branch-1", name: "Branch 1" },
  { id: "branch-2", name: "Branch 2" },
  { id: "warehouse", name: "Warehouse" },
]

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToastContext()
  const [darkMode, setDarkMode] = useState(false)
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [calendarView, setCalendarView] = useState("Month")
  const [user, setUser] = useState<any>(null)

  // Calendar data
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1).slice(0, 31)
  const firstDayOfMonth = 5 // Saturday (0-indexed, where 0 is Sunday)

  // Create calendar grid with empty cells for days before the 1st
  const calendarGrid = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarGrid.push(null)
  }
  for (const day of daysInMonth) {
    calendarGrid.push(day)
  }

  useEffect(() => {
    // Get user data
    const userData = getUser()
    setUser(userData)

    // Welcome toast - only show once when component mounts
    if (userData) {
      // Using a ref to track if toast has been shown would be better,
      // but for simplicity we'll just show it once on mount
      toast.info(`Welcome back, ${userData.username}!`)
    }
  }, [])

  const handleLocationChange = (value: string) => {
    // Navigate to the location-specific page
    router.push(`/admin/locations/${value}`)
    toast.success(`Navigating to ${mockLocations.find((loc) => loc.id === value)?.name || value}`)
  }

  const handlePointChange = (value: string) => {
    toast.success(`Point changed to ${value}`)
  }

  const handleCalendarNavigation = (direction: "prev" | "next") => {
    // This is a simplified implementation
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const [month, year] = currentMonth.split(" ")
    const monthIndex = months.indexOf(month)

    let newMonthIndex: number
    let newYear = Number.parseInt(year)

    if (direction === "prev") {
      newMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1
      if (newMonthIndex === 11) newYear--
    } else {
      newMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1
      if (newMonthIndex === 0) newYear++
    }

    setCurrentMonth(`${months[newMonthIndex]} ${newYear}`)
  }

  const handleDayClick = (day: number | null) => {
    if (day) {
      toast.info(`Selected day: ${day} ${currentMonth}`)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    toast.info(`${darkMode ? "Light" : "Dark"} mode activated`)
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`}>
      {/* Main content */}
      <div className="ml-[150px] flex-1 bg-gray-100">
        {/* Top navigation */}
        <header className="bg-white h-16 border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Select defaultValue="head-office" onValueChange={handleLocationChange}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue="cash-point" onValueChange={handlePointChange}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Select point" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash-point">CASH POINT</SelectItem>
                <SelectItem value="card-point">CARD POINT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin/report/bank">
              <Button variant="ghost" size="icon">
                <FileText className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <UserDropdown />
          </div>
        </header>

        {/* Main content area */}
        <div className="p-6">
          {/* Welcome header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg">
            <h1 className="text-xl font-medium">Hello, {user?.username || "Demo"}</h1>
          </div>

          {/* Stats cards */}
          <div className="bg-white rounded-b-lg p-4 mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px] p-4 border rounded-lg">
              <div className="flex items-start">
                <Home className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm text-gray-500">Location</div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-[150px] p-4 border rounded-lg">
              <div className="flex items-start">
                <div className="h-5 w-5 text-red-600 mr-2">👥</div>
                <div>
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-sm text-gray-500">Staff</div>
                </div>
              </div>
            </div>
          </div>

          {/* Module grid */}
          <div className="border-t-4 border-red-500 mb-6"></div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <Link
              href="/admin/configuration/lists"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <Settings className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Configuration</span>
            </Link>

            <Link
              href="/admin/hr/employee"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <div className="h-6 w-6">👥</div>
              </div>
              <span className="text-sm text-center">HR</span>
            </Link>

            <Link
              href="/admin/payroll/template"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Payroll</span>
            </Link>

            <Link
              href="/admin/contact/contractor"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <Phone className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Contact</span>
            </Link>

            <Link
              href="/admin/finance/discount-group"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <DollarSign className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Finance</span>
            </Link>

            <Link
              href="/admin/inventory/product"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Inventory</span>
            </Link>

            <Link
              href="/admin/payment/deposit"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Payment</span>
            </Link>

            <Link
              href="/admin/expenditure/purchase"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Expenditure</span>
            </Link>

            <Link
              href="/admin/service/general"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <Tool className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Service</span>
            </Link>

            <Link
              href="/admin/report/bank"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <BarChart2 className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Report</span>
            </Link>

            <Link
              href="/admin/store/store"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Store</span>
            </Link>

            <Link
              href="/admin/sales/sales"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Sales</span>
            </Link>

            <Link
              href="/admin/calendar/events"
              className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 flex items-center justify-center text-red-600 mb-2">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <span className="text-sm text-center">Calendar</span>
            </Link>
          </div>

          {/* Calendar */}
          <div className="border-t border-gray-200 mb-6"></div>

          <div className="bg-white rounded-lg border mb-6">
            <div className="p-4 border-b">
              <h2 className="font-medium">Calendar</h2>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleCalendarNavigation("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCalendarNavigation("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-sm" onClick={() => setCurrentMonth("March 2025")}>
                    Today
                  </Button>
                </div>

                <h3 className="text-lg font-medium">{currentMonth}</h3>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={calendarView === "Month" ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${calendarView === "Month" ? "bg-red-600 hover:bg-red-700" : ""}`}
                    onClick={() => setCalendarView("Month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={calendarView === "Week" ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${calendarView === "Week" ? "bg-red-600 hover:bg-red-700" : ""}`}
                    onClick={() => setCalendarView("Week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={calendarView === "Day" ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${calendarView === "Day" ? "bg-red-600 hover:bg-red-700" : ""}`}
                    onClick={() => setCalendarView("Day")}
                  >
                    Day
                  </Button>
                  <Button
                    variant={calendarView === "List" ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${calendarView === "List" ? "bg-red-600 hover:bg-red-700" : ""}`}
                    onClick={() => setCalendarView("List")}
                  >
                    List
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="text-center py-2 text-sm font-medium">
                    {day}
                  </div>
                ))}

                {calendarGrid.map((day, index) => (
                  <div
                    key={index}
                    className={`text-center py-2 text-sm ${day ? "hover:bg-gray-100 cursor-pointer" : ""}`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white p-4 border-t flex justify-between text-sm text-gray-500">
            <div>2025© DeskFlow</div>
            <div className="flex space-x-4">
              <Link href="/admin/about">About</Link>
              <Link href="/admin/support">Support</Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
