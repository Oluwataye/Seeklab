"use client"

import { useState } from "react"
import { List, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import CrudActions from "@/components/crud-actions"
import { CrudModal } from "@/components/crud-modal"
import ViewDetails from "@/components/view-details"
import { StatusBadge } from "@/components/status-badge"
import { useToastContext } from "@/components/toast-provider"

// Sample data
const initialLists = [
  {
    id: "LIST-101",
    name: "Document Types",
    category: "Documents",
    itemsCount: 8,
    status: "Active",
    description: "Types of documents used in the system",
    items: ["Invoice", "Receipt", "Contract", "Proposal", "Quote", "Order", "Delivery Note", "Return Form"],
  },
  {
    id: "LIST-102",
    name: "Payment Methods",
    category: "Finance",
    itemsCount: 5,
    status: "Active",
    description: "Methods of payment accepted by the system",
    items: ["Cash", "Credit Card", "Bank Transfer", "Check", "Mobile Money"],
  },
  {
    id: "LIST-103",
    name: "Tax Rates",
    category: "Finance",
    itemsCount: 4,
    status: "Active",
    description: "Tax rates applied to products and services",
    items: ["Standard VAT (7.5%)", "Reduced VAT (5%)", "Zero Rate (0%)", "Luxury Tax (10%)"],
  },
  {
    id: "LIST-104",
    name: "Units of Measure",
    category: "Inventory",
    itemsCount: 12,
    status: "Active",
    description: "Units used for measuring products",
    items: [
      "Piece",
      "Kilogram",
      "Gram",
      "Liter",
      "Milliliter",
      "Meter",
      "Centimeter",
      "Box",
      "Carton",
      "Dozen",
      "Pair",
      "Set",
    ],
  },
  {
    id: "LIST-105",
    name: "Status Codes",
    category: "System",
    itemsCount: 6,
    status: "Active",
    description: "Status codes used throughout the system",
    items: ["Active", "Inactive", "Pending", "Completed", "Cancelled", "On Hold"],
  },
]

export default function ListsPage() {
  const { toast } = useToastContext()
  const [lists, setLists] = useState(initialLists)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentList, setCurrentList] = useState<any>(null)
  const [newListItems, setNewListItems] = useState("")

  const filteredLists = lists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddList = (data: any) => {
    // Create new list
    const id = `LIST-${106 + lists.length}`
    const itemsArray = data.items.split("\n").filter((item: string) => item.trim() !== "")

    const list = {
      id,
      name: data.name,
      category: data.category,
      itemsCount: itemsArray.length,
      status: "Active",
      description: data.description,
      items: itemsArray,
    }

    // Add to list
    setLists([...lists, list])
    return Promise.resolve()
  }

  const handleEditList = (data: any) => {
    const itemsArray = data.items.split("\n").filter((item: string) => item.trim() !== "")

    // Update list
    setLists(
      lists.map((list) =>
        list.id === data.id
          ? {
              ...list,
              name: data.name,
              category: data.category,
              description: data.description,
              itemsCount: itemsArray.length,
              items: itemsArray,
            }
          : list,
      ),
    )
    return Promise.resolve()
  }

  const handleDeleteList = (id: string) => {
    setLists(lists.filter((list) => list.id !== id))
    toast.success("List Deleted", "List has been deleted successfully")
  }

  const openEditModal = (list: any) => {
    setCurrentList(list)
    setNewListItems(list.items.join("\n"))
    setIsEditModalOpen(true)
  }

  const openViewModal = (list: any) => {
    setCurrentList(list)
    setIsViewModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <List className="h-5 w-5 mr-2" />
          System Lists
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add List
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search lists..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  List ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  List Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Items Count
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
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
              {filteredLists.map((list) => (
                <tr key={list.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{list.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{list.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{list.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{list.itemsCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={list.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CrudActions
                      item={list}
                      itemType="List"
                      onEdit={() => openEditModal(list)}
                      onView={() => openViewModal(list)}
                      onDelete={() => handleDeleteList(list.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add List Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New List"
        mode="add"
        itemType="List"
        onSave={handleAddList}
      >
        <div>
          <Label htmlFor="name">List Name</Label>
          <Input id="name" name="name" required />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue="Documents">
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Documents">Documents</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Inventory">Inventory</SelectItem>
              <SelectItem value="System">System</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} />
        </div>

        <div>
          <Label htmlFor="items">List Items (one per line)</Label>
          <Textarea id="items" name="items" rows={5} placeholder="Enter each item on a new line" required />
        </div>
      </CrudModal>

      {/* Edit List Modal */}
      {currentList && (
        <CrudModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit List: ${currentList.name}`}
          mode="edit"
          itemType="List"
          onSave={handleEditList}
          initialData={currentList}
        >
          <input type="hidden" name="id" value={currentList.id} />

          <div>
            <Label htmlFor="edit-name">List Name</Label>
            <Input id="edit-name" name="name" defaultValue={currentList.name} required />
          </div>

          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Select name="category" defaultValue={currentList.category}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Documents">Documents</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" name="description" rows={2} defaultValue={currentList.description} />
          </div>

          <div>
            <Label htmlFor="edit-items">List Items (one per line)</Label>
            <Textarea id="edit-items" name="items" rows={5} defaultValue={currentList.items.join("\n")} required />
          </div>
        </CrudModal>
      )}

      {/* View List Modal */}
      {currentList && (
        <CrudModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`List Details: ${currentList.name}`}
          mode="view"
          itemType="List"
        >
          <div className="space-y-4">
            <ViewDetails label="List ID" value={currentList.id} />
            <ViewDetails label="List Name" value={currentList.name} />
            <ViewDetails label="Category" value={currentList.category} />
            <ViewDetails label="Description" value={currentList.description} />
            <ViewDetails label="Status" value={<StatusBadge status={currentList.status} />} />

            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">List Items ({currentList.itemsCount})</div>
              <div className="border rounded-md p-3 bg-gray-50">
                <ul className="list-disc pl-5 space-y-1">
                  {currentList.items.map((item: string, index: number) => (
                    <li key={index} className="text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CrudModal>
      )}
    </div>
  )
}
