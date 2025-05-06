"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/lib/hooks/use-toast"

// Mock data for teams
const mockTeams = [
  {
    id: "1",
    name: "Development Team",
    lead: "John Doe",
    members: 8,
    project: "DeskFlow App",
    status: "active",
    description: "Frontend and backend development team responsible for the DeskFlow application.",
    createdAt: "2023-05-15",
  },
  {
    id: "2",
    name: "Design Team",
    lead: "Jane Smith",
    members: 5,
    project: "DeskFlow App",
    status: "active",
    description: "UI/UX design team working on the DeskFlow application interface.",
    createdAt: "2023-05-20",
  },
  {
    id: "3",
    name: "QA Team",
    lead: "Robert Johnson",
    members: 4,
    project: "DeskFlow App",
    status: "inactive",
    description: "Quality assurance team responsible for testing the DeskFlow application.",
    createdAt: "2023-06-01",
  },
  {
    id: "4",
    name: "DevOps Team",
    lead: "Sarah Williams",
    members: 3,
    project: "Infrastructure",
    status: "active",
    description: "Team responsible for deployment, infrastructure, and operations.",
    createdAt: "2023-06-10",
  },
  {
    id: "5",
    name: "Marketing Team",
    lead: "Michael Brown",
    members: 6,
    project: "Product Launch",
    status: "active",
    description: "Team responsible for marketing and promotion of products.",
    createdAt: "2023-06-15",
  },
]

// Mock data for team members
const mockTeamMembers = [
  { id: "1", name: "John Doe", role: "Team Lead", email: "john.doe@example.com" },
  { id: "2", name: "Jane Smith", role: "Senior Developer", email: "jane.smith@example.com" },
  { id: "3", name: "Robert Johnson", role: "Developer", email: "robert.johnson@example.com" },
  { id: "4", name: "Sarah Williams", role: "Designer", email: "sarah.williams@example.com" },
  { id: "5", name: "Michael Brown", role: "QA Engineer", email: "michael.brown@example.com" },
  { id: "6", name: "Emily Davis", role: "Product Manager", email: "emily.davis@example.com" },
  { id: "7", name: "David Wilson", role: "DevOps Engineer", email: "david.wilson@example.com" },
  { id: "8", name: "Lisa Taylor", role: "UI/UX Designer", email: "lisa.taylor@example.com" },
  { id: "9", name: "James Anderson", role: "Backend Developer", email: "james.anderson@example.com" },
  { id: "10", name: "Patricia Thomas", role: "Frontend Developer", email: "patricia.thomas@example.com" },
]

// Mock data for projects
const mockProjects = [
  { id: "1", name: "DeskFlow App" },
  { id: "2", name: "Infrastructure" },
  { id: "3", name: "Product Launch" },
  { id: "4", name: "Website Redesign" },
  { id: "5", name: "Mobile App" },
]

export default function TeamsPage() {
  const { toast } = useToast()
  const [teams, setTeams] = useState(mockTeams)
  const [filteredTeams, setFilteredTeams] = useState(mockTeams)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")

  // Modal states
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false)
  const [isViewTeamModalOpen, setIsViewTeamModalOpen] = useState(false)
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false)
  const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    lead: "",
    project: "",
    description: "",
    status: "active",
    members: [] as string[],
  })

  // Apply filters
  useEffect(() => {
    let result = teams

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (team) =>
          team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.lead.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.project.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((team) => team.status === statusFilter)
    }

    // Project filter
    if (projectFilter !== "all") {
      result = result.filter((team) => team.project === projectFilter)
    }

    setFilteredTeams(result)
  }, [searchTerm, statusFilter, projectFilter, teams])

  // Handle view team
  const handleViewTeam = (team: any) => {
    setSelectedTeam(team)
    setIsViewTeamModalOpen(true)
  }

  // Handle edit team
  const handleEditTeam = (team: any) => {
    setSelectedTeam(team)
    setFormData({
      name: team.name,
      lead: team.lead,
      project: team.project,
      description: team.description,
      status: team.status,
      members: [], // In a real app, you would load the actual team members here
    })
    setIsEditTeamModalOpen(true)
  }

  // Handle delete team
  const handleDeleteTeam = (team: any) => {
    setSelectedTeam(team)
    setIsDeleteTeamModalOpen(true)
  }

  // Handle new team
  const handleNewTeam = () => {
    setFormData({
      name: "",
      lead: "",
      project: "",
      description: "",
      status: "active",
      members: [],
    })
    setIsNewTeamModalOpen(true)
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle member selection
  const handleMemberSelection = (memberId: string) => {
    setFormData((prev) => {
      const members = [...prev.members]
      if (members.includes(memberId)) {
        return { ...prev, members: members.filter((id) => id !== memberId) }
      } else {
        return { ...prev, members: [...members, memberId] }
      }
    })
  }

  // Submit new team
  const handleSubmitNewTeam = () => {
    // Validation
    if (!formData.name || !formData.lead || !formData.project) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newTeam = {
      id: (teams.length + 1).toString(),
      name: formData.name,
      lead: formData.lead,
      members: formData.members.length,
      project: formData.project,
      status: formData.status,
      description: formData.description,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setTeams([...teams, newTeam])
    setIsNewTeamModalOpen(false)
    toast({
      title: "Success",
      description: "Team created successfully",
    })
  }

  // Submit edit team
  const handleSubmitEditTeam = () => {
    // Validation
    if (!formData.name || !formData.lead || !formData.project) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const updatedTeams = teams.map((team) => {
      if (team.id === selectedTeam.id) {
        return {
          ...team,
          name: formData.name,
          lead: formData.lead,
          project: formData.project,
          status: formData.status,
          description: formData.description,
          // In a real app, you would update the members count based on the selected members
          members: formData.members.length || team.members,
        }
      }
      return team
    })

    setTeams(updatedTeams)
    setIsEditTeamModalOpen(false)
    toast({
      title: "Success",
      description: "Team updated successfully",
    })
  }

  // Confirm delete team
  const confirmDeleteTeam = () => {
    const updatedTeams = teams.filter((team) => team.id !== selectedTeam.id)
    setTeams(updatedTeams)
    setIsDeleteTeamModalOpen(false)
    toast({
      title: "Success",
      description: "Team deleted successfully",
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teams Management</h1>
        <Button onClick={handleNewTeam}>New Team</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={projectFilter} onValueChange={(value) => setProjectFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {mockProjects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Team Lead</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.lead}</TableCell>
                  <TableCell>{team.members}</TableCell>
                  <TableCell>{team.project}</TableCell>
                  <TableCell>
                    <StatusBadge status={team.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewTeam(team)}>
                        View Team
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditTeam(team)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteTeam(team)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No teams found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Team Modal */}
      <ViewDetails
        isOpen={isViewTeamModalOpen}
        onClose={() => setIsViewTeamModalOpen(false)}
        title="Team Details"
        data={
          selectedTeam
            ? [
                { label: "Team Name", value: selectedTeam.name },
                { label: "Team Lead", value: selectedTeam.lead },
                { label: "Project", value: selectedTeam.project },
                { label: "Members", value: selectedTeam.members.toString() },
                { label: "Status", value: <StatusBadge status={selectedTeam.status} /> },
                { label: "Description", value: selectedTeam.description },
                { label: "Created At", value: selectedTeam.createdAt },
              ]
            : []
        }
        onEdit={() => {
          setIsViewTeamModalOpen(false)
          handleEditTeam(selectedTeam)
        }}
      >
        {selectedTeam && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Team Members</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* In a real app, you would fetch the actual team members */}
                  {mockTeamMembers.slice(0, selectedTeam.members).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ViewDetails>

      {/* New Team Modal */}
      <CrudModal
        isOpen={isNewTeamModalOpen}
        onClose={() => setIsNewTeamModalOpen(false)}
        title="Create New Team"
        onSubmit={handleSubmitNewTeam}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Team Name *
            </label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1" required />
          </div>

          <div>
            <label htmlFor="lead" className="block text-sm font-medium text-gray-700">
              Team Lead *
            </label>
            <Select name="lead" value={formData.lead} onValueChange={(value) => handleSelectChange("lead", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select team lead" />
              </SelectTrigger>
              <SelectContent>
                {mockTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
              Project *
            </label>
            <Select
              name="project"
              value={formData.project}
              onValueChange={(value) => handleSelectChange("project", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
            <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
              {mockTeamMembers.map((member) => (
                <div key={member.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={formData.members.includes(member.id)}
                    onChange={() => handleMemberSelection(member.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`member-${member.id}`} className="text-sm">
                    {member.name} - {member.role}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CrudModal>

      {/* Edit Team Modal */}
      <CrudModal
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
        title="Edit Team"
        onSubmit={handleSubmitEditTeam}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
              Team Name *
            </label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-lead" className="block text-sm font-medium text-gray-700">
              Team Lead *
            </label>
            <Select name="lead" value={formData.lead} onValueChange={(value) => handleSelectChange("lead", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select team lead" />
              </SelectTrigger>
              <SelectContent>
                {mockTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="edit-project" className="block text-sm font-medium text-gray-700">
              Project *
            </label>
            <Select
              name="project"
              value={formData.project}
              onValueChange={(value) => handleSelectChange("project", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
            <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
              {mockTeamMembers.map((member) => (
                <div key={member.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`edit-member-${member.id}`}
                    checked={formData.members.includes(member.id)}
                    onChange={() => handleMemberSelection(member.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`edit-member-${member.id}`} className="text-sm">
                    {member.name} - {member.role}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CrudModal>

      {/* Delete Team Modal */}
      <CrudModal
        isOpen={isDeleteTeamModalOpen}
        onClose={() => setIsDeleteTeamModalOpen(false)}
        title="Delete Team"
        onSubmit={confirmDeleteTeam}
        submitLabel="Delete"
        submitVariant="destructive"
      >
        <p>Are you sure you want to delete the team "{selectedTeam?.name}"? This action cannot be undone.</p>
      </CrudModal>
    </div>
  )
}
