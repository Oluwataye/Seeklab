import React from "react";
import { Link } from "wouter";
import { EdecLayout } from "@/components/layout/edec-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2, UserPlus, CreditCard, ClipboardList, Users, TrendingUp } from "lucide-react";

export default function EdecDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/edec/stats'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ['/api/payment-settings'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <EdecLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">EDEC Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage patient registrations and payment verification
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Registered Patients</CardTitle>
              <CardDescription>Total patients in system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-3xl font-bold">{stats?.patientCount || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Verified Payments</CardTitle>
              <CardDescription>Total payments processed</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-3xl font-bold">{stats?.paymentCount || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Access Code Price</CardTitle>
              <CardDescription>Current standard price</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-3xl font-bold">
                  {paymentSettings?.currency} {paymentSettings?.accessCodePrice?.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Register patients and manage their information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-start space-x-4">
                <UserPlus className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Patient Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    Register new patients with personal and next of kin details
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Users className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Manage Patients</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage existing patient records
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Verify payments and manage access codes
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-start space-x-4">
                <CreditCard className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Payment Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify bank transfers and card payments for access codes
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <ClipboardList className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Test Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage pending and completed test requests
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
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

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                System activity in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`rounded-full p-1.5 ${
                        activity.type === 'registration' ? 'bg-green-100 text-green-600' :
                        activity.type === 'payment' ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {activity.type === 'registration' ? (
                          <UserPlus className="h-4 w-4" />
                        ) : activity.type === 'payment' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <ClipboardList className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
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
          </Card>
        </div>
      </div>
    </EdecLayout>
  );
}