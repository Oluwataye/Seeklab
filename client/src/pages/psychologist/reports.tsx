import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PsychologistLayout } from "../../components/layout/psychologist-layout";
import { Result } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Download, BarChart3, Calendar } from "lucide-react";

// Chart component for test result visualizations
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function PsychologistReports() {
  const [timeframe, setTimeframe] = useState("all");
  const [reportType, setReportType] = useState("testType");
  
  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Filter results based on timeframe
  const getFilteredResults = () => {
    if (timeframe === "all") return results;
    
    const now = new Date();
    let compareDate = new Date();
    
    if (timeframe === "month") {
      compareDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === "week") {
      compareDate.setDate(now.getDate() - 7);
    } else if (timeframe === "year") {
      compareDate.setFullYear(now.getFullYear() - 1);
    }
    
    return results.filter(result => {
      if (!result.resultData?.timestamp) return false;
      const resultDate = new Date(result.resultData.timestamp);
      return resultDate >= compareDate;
    });
  };

  const filteredResults = getFilteredResults();
  
  // Generate data for charts based on report type
  const getChartData = () => {
    if (reportType === "testType") {
      const testTypeCounts: Record<string, number> = {};
      
      filteredResults.forEach(result => {
        if (result.testType) {
          testTypeCounts[result.testType] = (testTypeCounts[result.testType] || 0) + 1;
        }
      });
      
      return Object.entries(testTypeCounts).map(([name, value]) => ({ name, value }));
    } else if (reportType === "assessmentStatus") {
      const assessed = filteredResults.filter(r => r.psychologistAssessment).length;
      const pending = filteredResults.filter(r => !r.psychologistAssessment).length;
      
      return [
        { name: "Assessed", value: assessed },
        { name: "Pending", value: pending },
      ];
    } else if (reportType === "monthly") {
      const monthlyData: Record<string, number> = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Initialize all months with 0
      months.forEach(month => {
        monthlyData[month] = 0;
      });
      
      filteredResults.forEach(result => {
        if (result.resultData?.timestamp) {
          const month = new Date(result.resultData.timestamp).getMonth();
          monthlyData[months[month]] += 1;
        }
      });
      
      return Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
    }
    
    return [];
  };
  
  const chartData = getChartData();
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Generate report name
  const getReportName = () => {
    let reportName = "";
    
    switch (reportType) {
      case "testType":
        reportName = "Test Types";
        break;
      case "assessmentStatus":
        reportName = "Assessment Status";
        break;
      case "monthly":
        reportName = "Monthly Distribution";
        break;
      default:
        reportName = "Report";
    }
    
    switch (timeframe) {
      case "week":
        reportName += " (Last Week)";
        break;
      case "month":
        reportName += " (Last Month)";
        break;
      case "year":
        reportName += " (Last Year)";
        break;
      default:
        reportName += " (All Time)";
    }
    
    return reportName;
  };

  return (
    <PsychologistLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={timeframe}
              onValueChange={setTimeframe}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={reportType}
              onValueChange={setReportType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testType">Test Types</SelectItem>
                <SelectItem value="assessmentStatus">Assessment Status</SelectItem>
                <SelectItem value="monthly">Monthly Distribution</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredResults.length}</div>
              <p className="text-xs text-muted-foreground">
                Tests performed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessed Tests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredResults.filter(r => r.psychologistAssessment).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tests with assessments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredResults.length > 0 
                  ? Math.round(filteredResults.filter(r => r.psychologistAssessment).length / filteredResults.length * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Assessment completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card className="p-4">
            <CardHeader>
              <CardTitle>{getReportName()}</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available for the selected criteria
                </div>
              ) : reportType === "assessmentStatus" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Data updated: {new Date().toLocaleDateString()}
              </div>
              <div>
                {filteredResults.length} records in selected timeframe
              </div>
            </CardFooter>
          </Card>
        )}
        
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search results..." className="pl-8" />
            </div>
            <div className="border rounded-md overflow-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Patient ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Test Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-sm text-muted-foreground">No data available</td>
                    </tr>
                  ) : (
                    filteredResults.map((result, index) => (
                      <tr key={result.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                        <td className="px-4 py-3 text-sm">
                          {result.resultData?.timestamp 
                            ? new Date(result.resultData.timestamp).toLocaleDateString() 
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">{result.patientId}</td>
                        <td className="px-4 py-3 text-sm">{result.testType}</td>
                        <td className="px-4 py-3 text-sm">
                          {result.psychologistAssessment ? (
                            <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Assessed
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PsychologistLayout>
  );
}