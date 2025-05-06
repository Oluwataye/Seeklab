"use client"

import { useState, useEffect } from "react"
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  CircleDashed,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/lib/hooks/use-toast"
import { format } from "date-fns"

// Mock data for tasks
const initialTasks = [
  {
    id: 1,
    name: "Design homepage wireframes",
    project: "Website Redesign",
    assignee: {
      id: "john-doe",
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    dueDate: "2023-04-15",
    priority: "high",
    status: "completed",
    progress: 100,
    description: "Create wireframes for the new homepage design.",
  },
  {
    id: 2,
    name: "Develop user authentication",
    project: "Mobile App Development",
    assignee: {
      id: "sarah-smith",
      name: "Sarah Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    dueDate: "2023-05-20",
    priority: "medium",
    status: "in-progress",
    progress: 60,
    description: "Implement user authentication flow for the mobile app.",
  },
  {
    id: 3,
    name: "Configure database schema",
    project: "ERP Implementation",
    assignee: {
      id: "mike-johnson",
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    dueDate: "2023-06-10",
    priority: "high",
    status: "in-progress",
    progress: 40,
    description: "Design and configure the database schema for the ERP system.",
  },
  {
    id: 4,
    name: "Create social media content",
    project: "Digital Marketing Campaign",
    assignee: {
      id: "emily-davis",
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    dueDate: "2023-07-05",
    priority: "low",
    status: "pending",
    progress: 0,
    description: "Create content for social media posts for the upcoming campaign.",
  },
  {
    id: 5,
    name: "Migrate database servers",
    project: "Data Center Migration",
    assignee: {
      id: "alex-turner",
      name: "Alex Turner",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    dueDate: "2023-06-25",
    priority: "high",
    status: "completed",
    progress: 100,
    description: "Migrate database servers to the new data center.",
  },
  {
    id: 6,
    name: "Conduct penetration testing",
    project: "Security Audit",
    assignee: {
      id: "lisa-wong",
      name: "Lisa Wong",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    dueDate: "2023-07-10",
    priority: "medium",
    status: "pending",
    progress: 0,
    description: "Conduct penetration testing on the system to identify vulnerabilities.",
  },
]

// Sample team members data for assignee selection
const teamMembers = [
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

// Sample projects data
const projects = [
  "Website Redesign",
  "Mobile App Development",
  "ERP Implementation",
  "Digital Marketing Campaign",
  "Data Center Migration",
  "Security Audit",
]

export default function TasksPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false)
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false)
  const [isViewTaskDialogOpen, setIsViewTaskDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<any>(null)

  const [newTask, setNewTask] = useState({
    name: "",
    project: "",
    assigneeId: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    progress: 0,
    description: "",
  })

  // Reset new task form when dialog closes
  useEffect(() => {
    if (!isNewTaskDialogOpen) {
      setNewTask({
        name: "",
        project: "",
        assigneeId: "",
        dueDate: "",
        priority: "medium",
        status: "pending",
        progress: 0,
        description: "",
      })
    }
  }, [isNewTaskDialogOpen])

  // Set form values when editing a task
  useEffect(() => {
    if (currentTask && isEditTaskDialogOpen) {
      setNewTask({
        name: currentTask.name,
        project: currentTask.project,
        assigneeId: currentTask.assignee.id,
        dueDate: currentTask.dueDate,
        priority: currentTask.priority,
        status: currentTask.status,
        progress: currentTask.progress,
        description: currentTask.description || "",
      })
    }
  }, [currentTask, isEditTaskDialogOpen])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <CircleDashed className="h-4 w-4 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return <CircleDashed className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="default">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      // Filter by tab (status)
      if (activeTab !== "all" && task.status !== activeTab) {
        return false
      }

      // Filter by search query
      if (
        searchQuery &&
        !task.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.project.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Filter by priority
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false
      }

      // Filter by project
      if (projectFilter !== "all" && task.project !== projectFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      if (!sortBy) return 0

      let valA, valB

      switch (sortBy) {
        case "name":
          valA = a.name
          valB = b.name
          break
        case "project":
          valA = a.project
          valB = b.project
          break
        case "assignee":
          valA = a.assignee.name
          valB = b.assignee.name
          break
        case "dueDate":
          valA = new Date(a.dueDate).getTime()
          valB = new Date(b.dueDate).getTime()
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          valA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          valB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        case "status":
          const statusOrder = { pending: 1, "in-progress": 2, completed: 3 }
          valA = statusOrder[a.status as keyof typeof statusOrder] || 0
          valB = statusOrder[b.status as keyof typeof statusOrder] || 0
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

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  // Add a new task
  const handleAddTask = () => {
    // Validate required fields
    if (!newTask.name || !newTask.project || !newTask.assigneeId || !newTask.dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const assignee = teamMembers.find((member) => member.id === newTask.assigneeId)
    if (!assignee) {
      toast({
        title: "Invalid assignee",
        description: "Please select a valid team member.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(...tasks.map((t) => t.id)) + 1

    const taskToAdd = {
      id: newId,
      name: newTask.name,
      project: newTask.project,
      assignee: assignee,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: newTask.status,
      progress: newTask.progress,
      description: newTask.description,
    }

    setTasks([...tasks, taskToAdd])
    setIsNewTaskDialogOpen(false)

    toast({
      title: "Task created",
      description: "The task has been successfully created.",
    })
  }

  // Edit an existing task
  const handleEditTask = () => {
    if (!currentTask) return

    // Validate required fields
    if (!newTask.name || !newTask.project || !newTask.assigneeId || !newTask.dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const assignee = teamMembers.find((member) => member.id === newTask.assigneeId)
    if (!assignee) {
      toast({
        title: "Invalid assignee",
        description: "Please select a valid team member.",
        variant: "destructive",
      })
      return
    }

    const updatedTasks = tasks.map((task) =>
      task.id === currentTask.id
        ? {
            ...task,
            name: newTask.name,
            project: newTask.project,
            assignee: assignee,
            dueDate: newTask.dueDate,
            priority: newTask.priority,
            status: newTask.status,
            progress: newTask.progress,
            description: newTask.description,
          }
        : task,
    )

    setTasks(updatedTasks)
    setIsEditTaskDialogOpen(false)

    toast({
      title: "Task updated",
      description: "The task has been successfully updated.",
    })
  }

  // Delete a task
  const handleDeleteTask = () => {
    if (!currentTask) return

    const updatedTasks = tasks.filter((task) => task.id !== currentTask.id)
    setTasks(updatedTasks)
    setIsDeleteDialogOpen(false)
    setCurrentTask(null)

    toast({
      title: "Task deleted",
      description: "The task has been successfully deleted.",
    })
  }

  // View task details
  const handleViewTask = (task: any) => {
    setCurrentTask(task)
    setIsViewTaskDialogOpen(true)
  }

  // Edit task
  const handleEditTaskClick = (task: any) => {
    setCurrentTask(task)
    setIsEditTaskDialogOpen(true)
  }

  // Delete task
  const handleDeleteTaskClick = (task: any) => {
    setCurrentTask(task)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <CheckSquare className="h-5 w-5 mr-2" />
          Task Management
        </h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 mt-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                <span>Priority</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                <span>Project</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsNewTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort("name")}
                    >
                      Task <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort("project")}
                    >
                      Project <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort("assignee")}
                    >
                      Assignee <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort("dueDate")}
                    >
                      Due Date <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort("priority")}
                    >
                      Priority <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort("status")}
                    >
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center"
                      onClick={() => handleSort("progress")}
                    >
                      Progress <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace("-", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTask(task)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTaskClick(task)}>Edit Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTaskClick(task)}>
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No tasks found. Try adjusting your filters or create a new task.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace("-", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTask(task)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTaskClick(task)}>Edit Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTaskClick(task)}>
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace("-", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTask(task)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTaskClick(task)}>Edit Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTaskClick(task)}>
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace("-", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTask(task)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTaskClick(task)}>Edit Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTaskClick(task)}>
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to the project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Task Name
              </Label>
              <Input
                id="name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">
                Project
              </Label>
              <Select value={newTask.project} onValueChange={(value) => setNewTask({ ...newTask, project: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assignee
              </Label>
              <Select
                value={newTask.assigneeId}
                onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an assignee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                type="date"
                id="dueDate"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                <SelectTrigger className="col-span-3">
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
                Progress
              </Label>
              <Input
                type="number"
                id="progress"
                value={newTask.progress}
                onChange={(e) => setNewTask({ ...newTask, progress: Number.parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsNewTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddTask} className="bg-red-600 hover:bg-red-700">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Edit the details of the selected task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Task Name
              </Label>
              <Input
                id="name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">
                Project
              </Label>
              <Select value={newTask.project} onValueChange={(value) => setNewTask({ ...newTask, project: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assignee
              </Label>
              <Select
                value={newTask.assigneeId}
                onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an assignee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                type="date"
                id="dueDate"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                <SelectTrigger className="col-span-3">
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
                Progress
              </Label>
              <Input
                type="number"
                id="progress"
                value={newTask.progress}
                onChange={(e) => setNewTask({ ...newTask, progress: Number.parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleEditTask} className="bg-red-600 hover:bg-red-700">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={isViewTaskDialogOpen} onOpenChange={setIsViewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>View the details of the selected task.</DialogDescription>
          </DialogHeader>
          {currentTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Task Name</Label>
                <div className="col-span-3 font-medium">{currentTask.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Project</Label>
                <div className="col-span-3">{currentTask.project}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Assignee</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={currentTask.assignee.avatar || "/placeholder.svg"}
                      alt={currentTask.assignee.name}
                    />
                    <AvatarFallback>{currentTask.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{currentTask.assignee.name}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Due Date</Label>
                <div className="col-span-3">{formatDate(currentTask.dueDate)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Priority</Label>
                <div className="col-span-3">{getPriorityBadge(currentTask.priority)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3 flex items-center gap-1">
                  {getStatusIcon(currentTask.status)}
                  <span className="capitalize">{currentTask.status.replace("-", " ")}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Progress</Label>
                <div className="col-span-3">
                  <div className="w-full">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${currentTask.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Description</Label>
                <div className="col-span-3">{currentTask.description || "No description provided."}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsViewTaskDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
