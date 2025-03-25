import React from "react";
import { Link } from "wouter";
import { EdecLayout } from "@/components/layout/edec-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { 
  Loader2, 
  UserPlus, 
  CreditCard, 
  ClipboardList, 
  Users,  
  ArrowUpRight, 
  BarChart4, 
  CircleDollarSign, 
  Activity,
  Clock,
  FileText,
  Bell,
  CalendarRange
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from "recharts";

export default function EdecDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/edec/stats'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ['/api/payment-settings'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Sample data for the chart - can be replaced with actual data when available
  const activityData = React.useMemo(() => [
    { name: 'Mon', registrations: 3, payments: 2 },
    { name: 'Tue', registrations: 5, payments: 4 },
    { name: 'Wed', registrations: 2, payments: 3 },
    { name: 'Thu', registrations: 6, payments: 5 },
    { name: 'Fri', registrations: 4, payments: 6 },
    { name: 'Sat', registrations: 3, payments: 2 },
    { name: 'Sun', registrations: 1, payments: 1 },
  ], []);

  return (
    <EdecLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/edec/register-patient">
                <UserPlus className="mr-2 h-4 w-4" />
                Register Patient
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/edec/verify-payment">
                <CreditCard className="mr-2 h-4 w-4" />
                Verify Payment
              </Link>
            </Button>
          </div>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Registered Patients
                </CardTitle>
                <Badge variant="outline" className="ml-auto">
                  Total
                </Badge>
              </div>
              <CardDescription>Total patients in system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">{stats?.patientCount || 0}</div>
                  {stats?.registrationTrend && (
                    <div className="flex items-center mt-2 text-sm">
                      <Badge variant="outline" className="bg-green-50 text-green-700 font-normal">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        {stats.registrationTrend.weeklyNew} new this week
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Verified Payments
                </CardTitle>
                <Badge variant="outline" className="ml-auto">
                  Total
                </Badge>
              </div>
              <CardDescription>Total payments processed</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">{stats?.paymentCount || 0}</div>
                  {/* Success rate - could be calculated from API data */}
                  <Progress 
                    value={75} 
                    className="h-2 mt-3 [&>div]:bg-green-500"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    75% verification rate
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                  Access Code Price
                </CardTitle>
                <Badge variant="outline" className="ml-auto">
                  Current
                </Badge>
              </div>
              <CardDescription>Standard price for patients</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">
                    {paymentSettings?.currency} {paymentSettings?.accessCodePrice?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-blue-50 text-blue-700 font-normal">
                      <ClipboardList className="mr-1 h-3 w-3" />
                      Standard Rate
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Pending Requests
                </CardTitle>
                <Badge variant="outline" className="ml-auto">
                  Current
                </Badge>
              </div>
              <CardDescription>Test requests awaiting action</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">
                    {stats?.pendingRequests || 0}
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-amber-50 text-amber-700 font-normal">
                      <FileText className="mr-1 h-3 w-3" />
                      Needs Attention
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity charts and insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  Activity Overview
                </CardTitle>
                <Badge variant="outline">
                  <CalendarRange className="mr-1 h-3 w-3" />
                  Last 7 days
                </Badge>
              </div>
              <CardDescription>
                Patient registrations and payment verification trends
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorRegistrations)"
                    name="Patient Registrations"
                  />
                  <Area
                    type="monotone"
                    dataKey="payments"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorPayments)"
                    name="Payment Verifications"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                Registrations
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                Payments
              </div>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Badge variant="outline">
                  Last 24 hours
                </Badge>
              </div>
              <CardDescription>
                System activity in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 max-h-80 overflow-y-auto pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 py-3 px-4 hover:bg-muted/30 rounded-md transition-colors">
                      <div className={`rounded-full p-2 ${
                        activity.type === 'registration' ? 'bg-purple-100 text-purple-600' :
                        activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'registration' ? (
                          <UserPlus className="h-4 w-4" />
                        ) : activity.type === 'payment' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <ClipboardList className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No recent activity found</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t py-3">
              <div className="flex w-full gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Link href="/edec/patients">View Patients</Link>
                </Button>
                <Button size="sm" className="flex-1">
                  <Link href="/edec/verify-payment">Verify Payment</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <CardTitle>Patient Management</CardTitle>
              </div>
              <CardDescription>
                Register patients and manage their information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Patient Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    Register new patients with personal and next of kin details
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Manage Patients</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage existing patient records
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" asChild>
                <Link href="/edec/patients">View Patients</Link>
              </Button>
              <Button asChild>
                <Link href="/edec/register-patient">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Patient
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle>Payment Management</CardTitle>
              </div>
              <CardDescription>
                Verify payments and manage access codes
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Payment Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify bank transfers and card payments for access codes
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Test Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage pending and completed test requests
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" asChild>
                <Link href="/edec/test-requests">Test Requests</Link>
              </Button>
              <Button asChild>
                <Link href="/edec/verify-payment">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Verify Payment
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </EdecLayout>
  );
}