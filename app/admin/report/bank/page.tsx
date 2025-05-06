"use client"

import { useState } from "react"
import { BanknoteIcon as BankIcon, FileBarChart, Download, Calendar, Search, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CrudModal } from "@/components/crud-modal"
import { useToastContext } from "@/components/toast-provider"

// Mock data for reports
const initialReports = [
  {
    id: "RPT-001",
    name: "Bank Statement",
    period: "March 2025",
    generatedDate: "28/03/2025",
    generatedBy: "John Smith",
    bank: "First Bank",
    accountNumber: "1234567890",
    startDate: "01/03/2025",
    endDate: "31/03/2025",
    transactions: [
      { date: "05/03/2025", description: "Deposit", amount: 5000, type: "Credit", balance: 15000 },
      { date: "12/03/2025", description: "Withdrawal", amount: 2000, type: "Debit", balance: 13000 },
      { date: "18/03/2025", description: "Vendor Payment", amount: 3500, type: "Debit", balance: 9500 },
      { date: "25/03/2025", description: "Customer Payment", amount: 7500, type: "Credit", balance: 17000 },
    ],
    summary: {
      openingBalance: 10000,
      totalCredits: 12500,
      totalDebits: 5500,
      closingBalance: 17000,
    },
  },
  {
    id: "RPT-002",
    name: "Bank Reconciliation",
    period: "Q1 2025",
    generatedDate: "25/03/2025",
    generatedBy: "Sarah Johnson",
    bank: "Zenith Bank",
    accountNumber: "0987654321",
    startDate: "01/01/2025",
    endDate: "31/03/2025",
    bankBalance: 25000,
    bookBalance: 24500,
    discrepancies: [
      { description: "Outstanding Check #1234", amount: 1200 },
      { description: "Deposit in Transit", amount: 2000 },
      { description: "Bank Fee Not Recorded", amount: 300 },
    ],
    summary: {
      adjustedBankBalance: 24500,
      adjustedBookBalance: 24500,
      difference: 0,
    },
  },
  {
    id: "RPT-003",
    name: "Cash Flow Analysis",
    period: "February 2025",
    generatedDate: "20/03/2025",
    generatedBy: "Michael Brown",
    startDate: "01/02/2025",
    endDate: "28/02/2025",
    cashFlowCategories: [
      { category: "Operating Activities", inflow: 45000, outflow: 32000, net: 13000 },
      { category: "Investing Activities", inflow: 5000, outflow: 15000, net: -10000 },
      { category: "Financing Activities", inflow: 20000, outflow: 8000, net: 12000 },
    ],
    summary: {
      totalInflow: 70000,
      totalOutflow: 55000,
      netCashFlow: 15000,
      openingBalance: 35000,
      closingBalance: 50000,
    },
  },
  {
    id: "RPT-004",
    name: "Bank Balance Summary",
    period: "January 2025",
    generatedDate: "15/03/2025",
    generatedBy: "Emily Davis",
    asOfDate: "31/01/2025",
    accounts: [
      { bank: "First Bank", accountNumber: "1234567890", accountType: "Current", balance: 25000 },
      { bank: "Zenith Bank", accountNumber: "0987654321", accountType: "Savings", balance: 35000 },
      { bank: "GTBank", accountNumber: "1122334455", accountType: "Current", balance: 18000 },
      { bank: "Access Bank", accountNumber: "5566778899", accountType: "Fixed Deposit", balance: 50000 },
    ],
    summary: {
      totalBalance: 128000,
      highestBalance: { bank: "Access Bank", balance: 50000 },
      lowestBalance: { bank: "GTBank", balance: 18000 },
    },
  },
  {
    id: "RPT-005",
    name: "Transaction History",
    period: "December 2024",
    generatedDate: "10/03/2025",
    generatedBy: "Robert Wilson",
    startDate: "01/12/2024",
    endDate: "31/12/2024",
    bank: "UBA",
    accountNumber: "9988776655",
    transactions: [
      { date: "05/12/2024", description: "Salary Payment", amount: 12000, type: "Credit", balance: 22000 },
      { date: "10/12/2024", description: "Rent Payment", amount: 5000, type: "Debit", balance: 17000 },
      { date: "15/12/2024", description: "Utility Bills", amount: 2000, type: "Debit", balance: 15000 },
      { date: "20/12/2024", description: "Customer Payment", amount: 8000, type: "Credit", balance: 23000 },
      { date: "25/12/2024", description: "Vendor Payment", amount: 4500, type: "Debit", balance: 18500 },
      { date: "30/12/2024", description: "Interest Earned", amount: 500, type: "Credit", balance: 19000 },
    ],
    summary: {
      openingBalance: 10000,
      totalCredits: 20500,
      totalDebits: 11500,
      closingBalance: 19000,
      transactionCount: 6,
    },
  },
]

// Bank list for dropdown
const banks = [
  { id: "BNK-101", name: "First Bank" },
  { id: "BNK-102", name: "Zenith Bank" },
  { id: "BNK-103", name: "GTBank" },
  { id: "BNK-104", name: "Access Bank" },
  { id: "BNK-105", name: "UBA" },
]

export default function BankReportPage() {
  const { toast } = useToastContext()
  const [reports, setReports] = useState(initialReports)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<any>(null)
  const [reportType, setReportType] = useState("Bank Statement")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBank, setFilterBank] = useState("all-banks")
  const [filterPeriod, setFilterPeriod] = useState("all-periods")

  // Filter reports based on search term and filters
  const filteredReports = reports.filter(
    (report) =>
      (report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterBank === "all-banks" || report.bank === filterBank) &&
      (filterPeriod === "all-periods" || report.period === filterPeriod),
  )

  // Get unique periods for filter
  const uniquePeriods = Array.from(new Set(reports.map((report) => report.period)))

  const handleGenerateReport = (data: any) => {
    // Generate a new ID
    const newId = `RPT-${reports.length + 1}`.padStart(7, "0")

    // Get current date in DD/MM/YYYY format
    const today = new Date()
    const generatedDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`

    // Find bank details
    const selectedBank = banks.find((bank) => bank.id === data.bankId)

    // Create base report object
    let newReport: any = {
      id: newId,
      name: data.reportType,
      period: data.period,
      generatedDate,
      generatedBy: "Current User", // In a real app, this would be the logged-in user
      startDate: data.startDate,
      endDate: data.endDate,
    }

    // Add bank-specific fields if applicable
    if (data.bankId) {
      newReport.bank = selectedBank?.name
      newReport.accountNumber = data.accountNumber || "1234567890" // Mock account number
    }

    // Add report-specific mock data based on report type
    switch (data.reportType) {
      case "Bank Statement":
        newReport = {
          ...newReport,
          transactions: [
            { date: "05/03/2025", description: "Deposit", amount: 5000, type: "Credit", balance: 15000 },
            { date: "12/03/2025", description: "Withdrawal", amount: 2000, type: "Debit", balance: 13000 },
          ],
          summary: {
            openingBalance: 10000,
            totalCredits: 5000,
            totalDebits: 2000,
            closingBalance: 13000,
          },
        }
        break
      case "Bank Reconciliation":
        newReport = {
          ...newReport,
          bankBalance: 25000,
          bookBalance: 24500,
          discrepancies: [
            { description: "Outstanding Check #1234", amount: 1200 },
            { description: "Deposit in Transit", amount: 2000 },
          ],
          summary: {
            adjustedBankBalance: 24500,
            adjustedBookBalance: 24500,
            difference: 0,
          },
        }
        break
      case "Cash Flow Analysis":
        newReport = {
          ...newReport,
          cashFlowCategories: [
            { category: "Operating Activities", inflow: 45000, outflow: 32000, net: 13000 },
            { category: "Investing Activities", inflow: 5000, outflow: 15000, net: -10000 },
          ],
          summary: {
            totalInflow: 50000,
            totalOutflow: 47000,
            netCashFlow: 3000,
            openingBalance: 35000,
            closingBalance: 38000,
          },
        }
        break
      case "Bank Balance Summary":
        newReport = {
          ...newReport,
          asOfDate: data.endDate,
          accounts: [
            { bank: "First Bank", accountNumber: "1234567890", accountType: "Current", balance: 25000 },
            { bank: "Zenith Bank", accountNumber: "0987654321", accountType: "Savings", balance: 35000 },
          ],
          summary: {
            totalBalance: 60000,
            highestBalance: { bank: "Zenith Bank", balance: 35000 },
            lowestBalance: { bank: "First Bank", balance: 25000 },
          },
        }
        break
      case "Transaction History":
        newReport = {
          ...newReport,
          transactions: [
            { date: "05/12/2024", description: "Salary Payment", amount: 12000, type: "Credit", balance: 22000 },
            { date: "10/12/2024", description: "Rent Payment", amount: 5000, type: "Debit", balance: 17000 },
          ],
          summary: {
            openingBalance: 10000,
            totalCredits: 12000,
            totalDebits: 5000,
            closingBalance: 17000,
            transactionCount: 2,
          },
        }
        break
    }

    // Add to reports array
    setReports([...reports, newReport])

    // Show success toast
    toast.success("Report Generated", "Report has been generated successfully")

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleViewReport = (reportName: string) => {
    // Find the most recent report of the specified type
    const report = reports
      .filter((r) => r.name === reportName)
      .sort((a, b) => {
        // Sort by date in descending order (most recent first)
        const dateA = a.generatedDate.split("/").reverse().join("")
        const dateB = b.generatedDate.split("/").reverse().join("")
        return dateB.localeCompare(dateA)
      })[0]

    if (report) {
      setCurrentReport(report)
      setIsViewModalOpen(true)
    } else {
      toast.error("Report Not Found", "No report of this type exists")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
  }

  const formatDate = (dateString: string) => {
    // Assuming dateString is in DD/MM/YYYY format
    return dateString
  }

  const handlePrintReport = () => {
    toast.success("Print Initiated", "Report sent to printer")
    // In a real app, this would trigger the print functionality
  }

  const handleDownloadReport = () => {
    toast.success("Download Started", "Report download initiated")
    // In a real app, this would trigger the download functionality
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <BankIcon className="h-5 w-5 mr-2" />
          Bank Reports
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsGenerateModalOpen(true)}>
          <FileBarChart className="h-4 w-4 mr-1" /> Generate Report
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Available Bank Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-2">Bank Statement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Detailed record of all bank transactions for a specific period.
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewReport("Bank Statement")}>
                View Report
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-2">Bank Reconciliation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Compare bank statement with internal records to identify discrepancies.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewReport("Bank Reconciliation")}
              >
                View Report
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-2">Cash Flow Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">Analysis of cash inflows and outflows through bank accounts.</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewReport("Cash Flow Analysis")}
              >
                View Report
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-2">Bank Balance Summary</h3>
              <p className="text-sm text-gray-600 mb-4">Summary of balances across all bank accounts.</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewReport("Bank Balance Summary")}
              >
                View Report
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-2">Transaction History</h3>
              <p className="text-sm text-gray-600 mb-4">
                Historical record of all bank transactions with filtering options.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewReport("Transaction History")}
              >
                View Report
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Recent Reports</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search reports..."
                  className="pl-8 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterBank} onValueChange={setFilterBank}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-banks">All Banks</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-periods">All Periods</SelectItem>
                  {uniquePeriods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Report Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Generated Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Generated By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      <div className="text-xs text-gray-500">{report.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.generatedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.generatedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-red-600 hover:text-red-900 mr-3"
                        onClick={() => {
                          setCurrentReport(report)
                          handleDownloadReport()
                        }}
                      >
                        Download
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => {
                          setCurrentReport(report)
                          setIsViewModalOpen(true)
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      <CrudModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Bank Report"
        mode="add"
        itemType="Report"
        onSave={handleGenerateReport}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select name="reportType" defaultValue="bank-statement" onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank-statement">Bank Statement</SelectItem>
                <SelectItem value="bank-reconciliation">Bank Reconciliation</SelectItem>
                <SelectItem value="cash-flow-analysis">Cash Flow Analysis</SelectItem>
                <SelectItem value="bank-balance-summary">Bank Balance Summary</SelectItem>
                <SelectItem value="transaction-history">Transaction History</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType !== "Bank Balance Summary" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <Input id="startDate" name="startDate" type="date" className="pl-10" required />
                </div>
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <Input id="endDate" name="endDate" type="date" className="pl-10" required />
                </div>
              </div>
            </div>
          )}

          {reportType === "Bank Balance Summary" && (
            <div>
              <Label htmlFor="endDate">As of Date</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Calendar className="h-4 w-4" />
                </span>
                <Input id="endDate" name="endDate" type="date" className="pl-10" required />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="period">Period</Label>
            <Select name="period" defaultValue="march-2025">
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="march-2025">March 2025</SelectItem>
                <SelectItem value="q1-2025">Q1 2025</SelectItem>
                <SelectItem value="february-2025">February 2025</SelectItem>
                <SelectItem value="january-2025">January 2025</SelectItem>
                <SelectItem value="december-2024">December 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(reportType === "Bank Statement" || reportType === "Transaction History") && (
            <>
              <div>
                <Label htmlFor="bankId">Bank</Label>
                <Select name="bankId" defaultValue="BNK-101">
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" name="accountNumber" placeholder="Enter account number" />
              </div>
            </>
          )}
        </div>
      </CrudModal>

      {/* View Report Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={currentReport?.name || "Report Details"}
        mode="view"
        itemType="Report"
        customFooter={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handlePrintReport}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {currentReport && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-bold">{currentReport.name}</h3>
                <p className="text-sm text-gray-500">ID: {currentReport.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Generated: {currentReport.generatedDate}</p>
                <p className="text-sm text-gray-500">By: {currentReport.generatedBy}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <p className="text-sm font-medium">Period</p>
                <p>{currentReport.period}</p>
              </div>
              {currentReport.bank && (
                <div>
                  <p className="text-sm font-medium">Bank</p>
                  <p>{currentReport.bank}</p>
                </div>
              )}
              {currentReport.accountNumber && (
                <div>
                  <p className="text-sm font-medium">Account Number</p>
                  <p>{currentReport.accountNumber}</p>
                </div>
              )}
              {currentReport.startDate && currentReport.endDate && (
                <div>
                  <p className="text-sm font-medium">Date Range</p>
                  <p>
                    {formatDate(currentReport.startDate)} - {formatDate(currentReport.endDate)}
                  </p>
                </div>
              )}
              {currentReport.asOfDate && (
                <div>
                  <p className="text-sm font-medium">As of Date</p>
                  <p>{formatDate(currentReport.asOfDate)}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Bank Statement */}
              {currentReport.name === "Bank Statement" && (
                <>
                  <h4 className="font-medium">Transactions</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentReport.transactions.map((transaction: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{transaction.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{transaction.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.type === "Credit"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              {formatCurrency(transaction.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Opening Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.openingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Closing Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.closingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Credits</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(currentReport.summary.totalCredits)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Debits</p>
                        <p className="font-medium text-red-600">{formatCurrency(currentReport.summary.totalDebits)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bank Reconciliation */}
              {currentReport.name === "Bank Reconciliation" && (
                <>
                  <h4 className="font-medium">Reconciliation Details</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Bank Balance</p>
                      <p className="font-medium">{formatCurrency(currentReport.bankBalance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Book Balance</p>
                      <p className="font-medium">{formatCurrency(currentReport.bookBalance)}</p>
                    </div>
                  </div>

                  <h4 className="font-medium">Discrepancies</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentReport.discrepancies.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Adjusted Bank Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.adjustedBankBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Adjusted Book Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.adjustedBookBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Difference</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.difference)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Cash Flow Analysis */}
              {currentReport.name === "Cash Flow Analysis" && (
                <>
                  <h4 className="font-medium">Cash Flow Categories</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Inflow</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Outflow</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentReport.cashFlowCategories.map((category: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{category.category}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-green-600">
                              {formatCurrency(category.inflow)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-red-600">
                              {formatCurrency(category.outflow)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              <span className={category.net >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(category.net)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Inflow</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(currentReport.summary.totalInflow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Outflow</p>
                        <p className="font-medium text-red-600">{formatCurrency(currentReport.summary.totalOutflow)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Net Cash Flow</p>
                        <p
                          className={`font-medium ${currentReport.summary.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(currentReport.summary.netCashFlow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Opening Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.openingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Closing Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.closingBalance)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bank Balance Summary */}
              {currentReport.name === "Bank Balance Summary" && (
                <>
                  <h4 className="font-medium">Account Balances</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Account Number
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Account Type
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentReport.accounts.map((account: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{account.bank}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{account.accountNumber}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{account.accountType}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              {formatCurrency(account.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.totalBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Highest Balance</p>
                        <p className="font-medium">
                          {currentReport.summary.highestBalance.bank}:{" "}
                          {formatCurrency(currentReport.summary.highestBalance.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lowest Balance</p>
                        <p className="font-medium">
                          {currentReport.summary.lowestBalance.bank}:{" "}
                          {formatCurrency(currentReport.summary.lowestBalance.balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Transaction History */}
              {currentReport.name === "Transaction History" && (
                <>
                  <h4 className="font-medium">Transactions</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentReport.transactions.map((transaction: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{transaction.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{transaction.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.type === "Credit"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                              {formatCurrency(transaction.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Opening Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.openingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Closing Balance</p>
                        <p className="font-medium">{formatCurrency(currentReport.summary.closingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Credits</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(currentReport.summary.totalCredits)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Debits</p>
                        <p className="font-medium text-red-600">{formatCurrency(currentReport.summary.totalDebits)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transaction Count</p>
                        <p className="font-medium">{currentReport.summary.transactionCount}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CrudModal>
    </div>
  )
}
