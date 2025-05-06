"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Users, Package, ShoppingCart, DollarSign, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToastContext } from "@/components/toast-provider"

// Mock locations data
const mockLocations = [
  {
    id: "head-office",
    name: "Head Office",
    address: "123 Main Street, Lagos",
    manager: "John Doe",
    staffCount: 8,
    inventory: 245,
    sales: {
      today: 12500,
      week: 87500,
      month: 350000,
    },
    recentTransactions: [
      { id: "TRX-001", date: "2025-03-01", amount: 2500, type: "Sale" },
      { id: "TRX-002", date: "2025-03-01", amount: 1800, type: "Sale" },
      { id: "TRX-003", date: "2025-03-02", amount: 3200, type: "Sale" },
      { id: "TRX-004", date: "2025-03-02", amount: 5000, type: "Sale" },
    ],
  },
  {
    id: "branch-1",
    name: "Branch 1",
    address: "45 Park Avenue, Abuja",
    manager: "Jane Smith",
    staffCount: 5,
    inventory: 180,
    sales: {
      today: 8500,
      week: 59500,
      month: 238000,
    },
    recentTransactions: [
      { id: "TRX-101", date: "2025-03-01", amount: 1500, type: "Sale" },
      { id: "TRX-102", date: "2025-03-01", amount: 2800, type: "Sale" },
      { id: "TRX-103", date: "2025-03-02", amount: 1200, type: "Sale" },
      { id: "TRX-104", date: "2025-03-02", amount: 3000, type: "Sale" },
    ],
  },
  {
    id: "branch-2",
    name: "Branch 2",
    address: "78 Market Road, Port Harcourt",
    manager: "Michael Johnson",
    staffCount: 4,
    inventory: 150,
    sales: {
      today: 7500,
      week: 52500,
      month: 210000,
    },
    recentTransactions: [
      { id: "TRX-201", date: "2025-03-01", amount: 1800, type: "Sale" },
      { id: "TRX-202", date: "2025-03-01", amount: 2200, type: "Sale" },
      { id: "TRX-203", date: "2025-03-02", amount: 1700, type: "Sale" },
      { id: "TRX-204", date: "2025-03-02", amount: 1800, type: "Sale" },
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse",
    address: "15 Industrial Way, Kano",
    manager: "Sarah Williams",
    staffCount: 3,
    inventory: 520,
    sales: {
      today: 0,
      week: 0,
      month: 0,
    },
    recentTransactions: [
      { id: "TRX-301", date: "2025-03-01", amount: 15000, type: "Stock Transfer" },
      { id: "TRX-302", date: "2025-03-01", amount: 22000, type: "Stock Purchase" },
      { id: "TRX-303", date: "2025-03-02", amount: 18000, type: "Stock Transfer" },
      { id: "TRX-304", date: "2025-03-02", amount: 25000, type: "Stock Purchase" },
    ],
  },
]

export default function LocationPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToastContext()
  const [location, setLocation] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const locationId = params.locationId as string

  useEffect(() => {
    // Find the location data based on the locationId
    const locationData = mockLocations.find((loc) => loc.id === locationId)

    if (locationData) {
      setLocation(locationData)
    } else {
      toast.error("Location not found")
      router.push("/admin")
    }
  }, [locationId, router, toast])

  if (!location) {
    return (
      <div className="ml-[150px] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg text-gray-500">Loading location data...</p>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="ml-[150px] p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-xl font-medium flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {location.name}
          </h1>
        </div>

        <div className="bg-white rounded-b-lg p-4 shadow-md">
          <p className="text-gray-600">{location.address}</p>
          <p className="text-gray-600">Manager: {location.manager}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-2xl font-bold">{location.staffCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Inventory Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-2xl font-bold">{location.inventory}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Today's Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-2xl font-bold">{formatCurrency(location.sales.today)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Monthly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-2xl font-bold">{formatCurrency(location.sales.month)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Transaction ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {location.recentTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">This location has {location.inventory} items in inventory.</p>
              <Button>
                <FileText className="h-4 w-4 mr-2" /> View Inventory Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">Today</p>
                    <p className="text-2xl font-bold">{formatCurrency(location.sales.today)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">This Week</p>
                    <p className="text-2xl font-bold">{formatCurrency(location.sales.week)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold">{formatCurrency(location.sales.month)}</p>
                  </div>
                </div>
                <Button>
                  <FileText className="h-4 w-4 mr-2" /> View Sales Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">This location has {location.staffCount} staff members.</p>
              <Button>
                <Users className="h-4 w-4 mr-2" /> View Staff List
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
