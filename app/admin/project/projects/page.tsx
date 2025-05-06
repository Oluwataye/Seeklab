"use client"

import { useState, useEffect } from "react"
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  CircleDashed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/lib/hooks/use-toast"
import { format } from "date-fns"

// Sample team members data
const teamMembersData = [
  {
    id: "john-doe",
    name: "John Doe",
    role: "Team Lead",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "sarah-smith",
    name: "Sarah Smith",
    role: "Frontend Developer",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "mike-johnson",
    name: "Mike Johnson",
    role: "Backend Developer",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "emily-davis",
    name: "Emily Davis",
    role: "UI/UX Designer",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "alex-turner",
    name: "Alex Turner",
    role: "Data Scientist",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "lisa-wong",
    name: "Lisa Wong",
    role: "Business Analyst",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

// Sample clients data
const clientsData = [
  { id: "abc-corp", name: "ABC Corporation" },
  { id: "xyz-inc", name: "XYZ Inc." },
  { id: "global-ent", name: "Global Enterprises" },
  { id: "retail-sol", name: "Retail Solutions" },
  { id: "financial-svcs", name: "Financial Services Ltd" },
  { id: "healthcare-sys", name: "Healthcare Systems" },
  { id: "internal", name: "Internal Project" },
]

// Sample initial projects data
const initialProjectsData = [
  {
    id: 1,
    name: "Website Redesign",
    clientId: "abc-corp",
    startDate: "2023-01-15",
    endDate: "2023-04-30",
    status: "completed",
    progress: 100,
    budget: 15000,
    teamMembers: ["john-doe", "sarah-smith", "mike-johnson"],
    description: "Complete redesign of corporate website with new branding and improved UX.",
    tasks: [
      { id: 1, name: "Design homepage wireframes", status: "completed", assigneeId: "emily-davis" },
      { id: 2, name: "Develop responsive layout", status: "completed", assigneeId: "sarah-smith" },
      { id: 3, name: "Content migration", status: "completed", assigneeId: "mike-johnson" },
    ],
  },
  {
    id: 2,
    name: "Mobile App Development",
    clientId: "xyz-inc",
    startDate: "2023-03-01",
    endDate: "2023-08-15",
    status: "in-progress",
    progress: 65,
    budget: 45000,
    teamMembers: ["emily-davis", "alex-turner", "lisa-wong"],
    description: "Develop a cross-platform mobile application for customer engagement.",
    tasks: [
      { id: 4, name: "UI/UX Design", status: "completed", assigneeId: "emily-davis" },
      { id: 5, name: "Frontend Development", status: "in-progress", assigneeId: "sarah-smith" },
      { id: 6, name: "Backend Integration", status: "pending", assigneeId: "mike-johnson" },
    ],
  },
  {
    id: 3,
    name: "ERP Implementation",
    clientId: "global-ent",
    startDate: "2023-02-10",
    endDate: "2023-12-31",
    status: "in-progress",
    progress: 40,
    budget: 120000,
    teamMembers: ["john-doe", "lisa-wong", "alex-turner"],
    description: "Implementation of enterprise resource planning system across all departments.",
    tasks: [
      { id: 7, name: "Requirements Gathering", status: "completed", assigneeId: "lisa-wong" },
      { id: 8, name: "Database Configuration", status: "in-progress", assigneeId: "alex-turner" },
      { id: 9, name: "User Training", status: "pending", assigneeId: "john-doe" },
    ],
  },
  {
    id: 4,
    name: "Digital Marketing Campaign",
    clientId: "retail-sol",
    startDate: "2023-05-01",
    endDate: "2023-07-31",
    status: "in-progress",
    progress: 80,
    budget: 25000,
    teamMembers: ["sarah-smith", "mike-johnson"],
    description: "Comprehensive digital marketing campaign across multiple channels.",
    tasks: [
      { id: 10, name: "Social Media Content", status: "in-progress", assigneeId: "sarah-smith" },
      { id: 11, name: "Email Campaign", status: "completed", assigneeId: "mike-johnson" },
    ],
  },
  {
    id: 5,
    name: "Data Center Migration",
    clientId: "financial-svcs",
    startDate: "2023-04-15",
    endDate: "2023-06-30",
    status: "completed",
    progress: 100,
    budget: 85000,
    teamMembers: ["alex-turner", "john-doe", "mike-johnson"],
    description: "Migration of on-premises data center to cloud infrastructure.",
    tasks: [
      { id: 12, name: "Infrastructure Planning", status: "completed", assigneeId: "alex-turner" },
      { id: 13, name: "Data Migration", status: "completed", assigneeId: "mike-johnson" },
      { id: 14, name: "Testing and Validation", status: "completed", assigneeId: "john-doe" },
    ],
  },
  {
    id: 6,
    name: "Security Audit",
    clientId: "healthcare-sys",
    startDate: "2023-06-01",
    endDate: "2023-07-15",
    status: "pending",
    progress: 0,
    budget: 18000,
    teamMembers: ["lisa-wong", "alex-turner"],
    description: "Comprehensive security audit and vulnerability assessment.",
    tasks: [
      { id: 15, name: "Penetration Testing", status: "pending", assigneeId: "alex-turner" },
      { id: 16, name: "Compliance Review", status: "pending", assigneeId: "lisa-wong" },
    ],
  },
]

export default function ProjectsPage() {
  const { toast } = useToast()
  const [projectsData, setProjectsData] = useState(initialProjectsData)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false)
  const [isViewProjectModalOpen, setIsViewProjectModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const [currentProject, setCurrentProject] = useState<any>(null)
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])

  const [newProject, setNewProject] = useState({
    name: "",
    clientId: "",
    startDate: "",
    endDate: "",
    status: "pending",
    progress: 0,
    budget: "",
    description: "",
  })

  // Reset new project form when modal closes
  useEffect(() => {
    if (!isNewProjectModalOpen) {
      setNewProject({
        name: "",
        clientId: "",
        startDate: "",
        endDate: "",
        status: "pending",
        progress: 0,
        budget: "",
        description: "",
      })
      setSelectedTeamMembers([])
    }
  }, [isNewProjectModalOpen])

  // Set selected team members when editing a project
  useEffect(() => {
    if (currentProject && isEditProjectModalOpen) {
      setSelectedTeamMembers(currentProject.teamMembers || [])
    }
  }, [currentProject, isEditProjectModalOpen])

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <CircleDashed className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      default:
        return <CircleDashed className="h-5 w-5 text-gray-500" />
    }
  }

  // Get status text based on status
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in-progress":
        return "In Progress"
      case "pending":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  // Get status class based on status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper to find client name by id
  const getClientName = (clientId: string) => {
    const client = clientsData.find((c) => c.id === clientId)
    return client ? client.name : "Unknown Client"
  }

  // Format date string to readable format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Handle team member selection
  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  // Filter projects
  const filteredProjects = projectsData
    .filter((project) => {
      // Filter by tab (status)
      const matchesStatus = activeTab === "all" || project.status === activeTab

      // Filter by search query
      const matchesSearch =
        !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getClientName(project.clientId).toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by client
      const matchesClient = clientFilter === "all" || project.clientId === clientFilter

      return matchesStatus && matchesSearch && matchesClient
    })
    .sort((a, b) => {
      if (!sortField) return 0

      let valA, valB

      switch (sortField) {
        case "name":
          valA = a.name
          valB = b.name
          break
        case "client":
          valA = getClientName(a.clientId)
          valB = getClientName(b.clientId)
          break
        case "date":
          valA = new Date(a.startDate).getTime()
          valB = new Date(b.startDate).getTime()
          break
        case "budget":
          valA = a.budget
          valB = b.budget
          break
        case "progress":
          valA = a.progress
          valB = b.progress
          break
        default:
          return 0
      }

      if (valA === valB) return 0

      const result = valA < valB ? -1 : 1
      return sortDirection === "asc" ? result : -result
    })

  // Add a new project
  const handleAddProject = () => {
    // Validate required fields
    if (!newProject.name || !newProject.clientId || !newProject.startDate || !newProject.endDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(...projectsData.map((p) => p.id)) + 1

    const projectToAdd = {
      ...newProject,
      id: newId,
      budget: Number.parseFloat(newProject.budget) || 0,
      teamMembers: selectedTeamMembers,
      tasks: [],
    }

    setProjectsData([...projectsData, projectToAdd])
    setIsNewProjectModalOpen(false)

    toast({
      title: "Project created",
      description: "The project has been successfully created.",
    })
  }

  // Edit an existing project
  const handleEditProject = () => {
    if (!currentProject) return

    // Validate required fields
    if (!currentProject.name || !currentProject.clientId || !currentProject.startDate || !currentProject.endDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const updatedProject = {
      ...currentProject,
      teamMembers: selectedTeamMembers,
    }

    const updatedProjects = projectsData.map((project) => (project.id === currentProject.id ? updatedProject : project))

    setProjectsData(updatedProjects)
    setIsEditProjectModalOpen(false)

    toast({
      title: "Project updated",
      description: "The project has been successfully updated.",
    })
  }

  // Delete a project
  const handleDeleteProject = () => {
    if (!currentProject) return

    const updatedProjects = projectsData.filter((project) => project.id !== currentProject.id)
    setProjectsData(updatedProjects)
    setIsDeleteConfirmOpen(false)
    setCurrentProject(null)

    toast({
      title: "Project deleted",
      description: "The project has been successfully deleted.",
    })
  }

  // Toggle sort when column header is clicked
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Open the view project modal
  const openViewProjectModal = (project: any) => {
    setCurrentProject(project)
    setIsViewProjectModalOpen(true)
  }

  // Open the edit project modal
  const openEditProjectModal = (project: any) => {
    setCurrentProject(project)
    setIsEditProjectModalOpen(true)
  }

  // Open edit from view
  const openEditFromView = () => {
    setIsViewProjectModalOpen(false)
    setIsEditProjectModalOpen(true)
  }

  // Open delete confirmation
  const openDeleteConfirm = (project: any) => {
    setCurrentProject(project)
    setIsDeleteConfirmOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg mb-6">
        <h1 className="text-xl font-medium flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Project Management
        </h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="min-w-[150px] w-auto">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                <span>Filter by Client</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clientsData.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsNewProjectModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewProjectModal(project)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditProjectModal(project)}>Edit Project</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteConfirm(project)}>
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{getClientName(project.clientId)}</CardDescription>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusClass(project.status)}`}
                  >
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{getStatusText(project.status)}</span>
                  </span>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{project.teamMembers.length} team members</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openViewProjectModal(project)}>
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                No projects found. Try adjusting your search or filter criteria.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                {/* Card content same as "all" tab */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewProjectModal(project)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditProjectModal(project)}>Edit Project</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteConfirm(project)}>
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{getClientName(project.clientId)}</CardDescription>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusClass(project.status)}`}
                  >
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{getStatusText(project.status)}</span>
                  </span>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{project.teamMembers.length} team members</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openViewProjectModal(project)}>
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                {/* Card content same as "all" tab */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewProjectModal(project)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditProjectModal(project)}>Edit Project</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteConfirm(project)}>
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{getClientName(project.clientId)}</CardDescription>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusClass(project.status)}`}
                  >
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{getStatusText(project.status)}</span>
                  </span>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{project.teamMembers.length} team members</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openViewProjectModal(project)}>
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                {/* Card content same as "all" tab */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewProjectModal(project)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditProjectModal(project)}>Edit Project</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteConfirm(project)}>
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{getClientName(project.clientId)}</CardDescription>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusClass(project.status)}`}
                  >
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{getStatusText(project.status)}</span>
                  </span>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{project.teamMembers.length} team members</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openViewProjectModal(project)}>
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Project Modal */}
      <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Enter the project details. Fields marked with * are required.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 max-h-[60vh] custom-scrollbar">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project-name" className="text-right">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="project-name"
                  className="col-span-3"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newProject.clientId}
                  onValueChange={(value) => setNewProject({ ...newProject, clientId: value })}
                >
                  <SelectTrigger id="client" className="col-span-3">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  className="col-span-3"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  className="col-span-3"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget
                </Label>
                <Input
                  id="budget"
                  type="number"
                  className="col-span-3"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  placeholder="Enter budget amount"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                >
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="progress" className="text-right">
                  Progress (%)
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={newProject.progress}
                    onChange={(e) => setNewProject({ ...newProject, progress: Number.parseInt(e.target.value) || 0 })}
                  />
                  <div className="w-full max-w-[150px] bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: `${newProject.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">Team Members</Label>
                <div className="col-span-3 border rounded-md p-3 max-h-[200px] overflow-y-auto">
                  <div className="space-y-2">
                    {teamMembersData.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={selectedTeamMembers.includes(member.id)}
                          onCheckedChange={() => handleTeamMemberToggle(member.id)}
                        />
                        <label
                          htmlFor={`member-${member.id}`}
                          className="text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>
                            {member.name} <span className="text-gray-500">({member.role})</span>
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      {currentProject && (
        <Dialog open={isEditProjectModalOpen} onOpenChange={setIsEditProjectModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update the project details. Fields marked with * are required.</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto pr-1 max-h-[60vh] custom-scrollbar">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-project-name" className="text-right">
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-project-name"
                    className="col-span-3"
                    value={currentProject.name}
                    onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-client" className="text-right">
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={currentProject.clientId}
                    onValueChange={(value) => setCurrentProject({ ...currentProject, clientId: value })}
                  >
                    <SelectTrigger id="edit-client" className="col-span-3">
                      <SelectValue>{getClientName(currentProject.clientId)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    className="col-span-3"
                    rows={3}
                    value={currentProject.description}
                    onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-start-date" className="text-right">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    className="col-span-3"
                    value={currentProject.startDate}
                    onChange={(e) => setCurrentProject({ ...currentProject, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-end-date" className="text-right">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    className="col-span-3"
                    value={currentProject.endDate}
                    onChange={(e) => setCurrentProject({ ...currentProject, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-budget" className="text-right">
                    Budget
                  </Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    className="col-span-3"
                    value={currentProject.budget}
                    onChange={(e) => setCurrentProject({ ...currentProject, budget: e.target.value })}
                    placeholder="Enter budget amount"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={currentProject.status}
                    onValueChange={(value) => setCurrentProject({ ...currentProject, status: value })}
                  >
                    <SelectTrigger id="edit-status" className="col-span-3">
                      <SelectValue>{getStatusText(currentProject.status)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-progress" className="text-right">
                    Progress (%)
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="edit-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={currentProject.progress}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, progress: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                    <div className="w-full max-w-[150px] bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${currentProject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Label className="text-right pt-2">Team Members</Label>
                  <div className="col-span-3 border rounded-md p-3 max-h-[200px] overflow-y-auto">
                    <div className="space-y-2">
                      {teamMembersData.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-member-${member.id}`}
                            checked={selectedTeamMembers.includes(member.id)}
                            onCheckedChange={() => handleTeamMemberToggle(member.id)}
                          />
                          <label
                            htmlFor={`edit-member-${member.id}`}
                            className="text-sm flex items-center gap-2 cursor-pointer"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>
                              {member.name} <span className="text-gray-500">({member.role})</span>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditProjectModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleEditProject}>
                Update Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Project Modal */}
      {currentProject && (
        <Dialog open={isViewProjectModalOpen} onOpenChange={setIsViewProjectModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{currentProject.name}</DialogTitle>
              <DialogDescription>Project details and team information.</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto pr-1 max-h-[60vh] custom-scrollbar">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Client</Label>
                    <p className="font-medium">{getClientName(currentProject.clientId)}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusClass(currentProject.status)}>
                      {getStatusText(currentProject.status)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Description</Label>
                    <p className="text-gray-600">{currentProject.description || "No description provided."}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <p className="font-medium">{formatDate(currentProject.startDate)}</p>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <p className="font-medium">{formatDate(currentProject.endDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Budget</Label>
                    <p className="font-medium">{formatCurrency(Number.parseFloat(currentProject.budget))}</p>
                  </div>
                  <div>
                    <Label>Progress</Label>
                    <div className="flex items-center">
                      <span className="mr-2">{currentProject.progress}%</span>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${currentProject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Team Members</Label>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.teamMembers.map((memberId) => {
                      const member = teamMembersData.find((m) => m.id === memberId)
                      return member ? (
                        <div key={member.id} className="flex items-center space-x-2 border rounded-md px-2 py-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewProjectModalOpen(false)}>
                Close
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={openEditFromView}>
                Edit Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
