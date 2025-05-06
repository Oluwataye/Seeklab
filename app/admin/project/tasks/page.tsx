"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/lib/hooks/use-toast"

// Mock data for tasks
const mockTasks = [
  {
    id: "1",
    title: "Implement login functionality",
    project: "DeskFlow App",
    assignee: "John Doe",
    priority: "high",
    status: "in-progress",
    dueDate: "2023-07-15",
    description: "Implement user authentication and login functionality for the DeskFlow application.",
    createdAt: "2023-06-01",
  },
  {
    id: "2",
    title: "Design dashboard UI",
    project: "DeskFlow App",
    assignee: "Jane Smith",
    priority: "medium",
    status: "completed",
    dueDate: "2023-06-30",
    description: "Create UI design for the main dashboard of the DeskFlow application.",
    createdAt: "2023-06-05",
  },
  {
    id: "3",
    title: "Fix navigation bug",
    project: "DeskFlow App",
    assignee: "Robert Johnson",
    priority: "high",
    status: "pending",
    dueDate: "2023-07-10",
    description: "Fix the navigation bug that occurs when switching between different sections of the app.",
    createdAt: "2023-06-10",
  },
  {
    id: "4",
    title: "Set up CI/CD pipeline",
    project: "Infrastructure",
    assignee: "Sarah Williams",
    priority: "medium",
    status: "in-progress",
    dueDate: "2023-07-20",
    description: "Set up continuous integration and deployment pipeline for the project.",
    createdAt: "2023-06-15",
  },
  {
    id: "5",
    title: "Create marketing materials",
    project: "Product Launch",
    assignee: "Michael Brown",
    priority: "low",
    status: "pending",
    dueDate: "2023-08-01",
    description: "Create marketing materials for the upcoming product launch.",
    createdAt: "2023-06-20",
  },
]

// Mock data for team members
const mockTeamMembers = [
  { id: "1", name: "John Doe", role: "Team Lead" },
  { id: "2", name: "Jane Smith", role: "Senior Developer" },
  { id: "3", name: "Robert Johnson", role: "Developer" },
  { id: "4", name: "Sarah Williams", role: "Designer" },
  { id: "5", name: "Michael Brown", role: "QA Engineer" },
]

// Mock data for projects
const mockProjects = [
  { id: "1", name: "DeskFlow App" },
  { id: "2", name: "Infrastructure" },
  { id: "3", name: "Product Launch" },
  { id: "4", name: "Website Redesign" },
  { id: "5", name: "Mobile App" },
]

export default function TasksPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState(mockTasks)
  const [filteredTasks, setFilteredTasks] = useState(mockTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  
  // Modal states
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignee: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    description: ''
  })

  // Apply filters
  useEffect(() => {
    let result = tasks

    // Search filter
    if (searchTerm) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter)
    }

    // Project filter
    if (projectFilter !== 'all') {
      result = result.filter(task => task.project === projectFilter)
    }

    setFilteredTasks(result)
  }, [searchTerm, statusFilter, priorityFilter, projectFilter, tasks])

  // Handle view task
  const handleViewTask = (task: any) => {
    setSelectedTask(task)
    setIsViewTaskModalOpen(true)
  }

  // Handle edit task
  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      project: task.project,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      description: task.description
    })
    setIsEditTaskModalOpen(true)
  }

  // Handle delete task
  const handleDeleteTask = (task: any) => {
    setSelectedTask(task)
    setIs
