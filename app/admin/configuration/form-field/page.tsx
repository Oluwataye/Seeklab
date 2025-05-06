"use client"

import { useState } from "react"
import { FormInput, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CrudModal } from "@/components/crud-modal"
import { ViewDetails } from "@/components/view-details"
import { useToastContext } from "@/components/toast-provider"

// Mock data for form fields
const initialFormFields = [
  {
    id: "FLD-101",
    name: "Full Name",
    type: "Text",
    form: "Employee",
    required: "Yes",
  },
  {
    id: "FLD-102",
    name: "Email Address",
    type: "Email",
    form: "Contact",
    required: "Yes",
  },
  {
    id: "FLD-103",
    name: "Phone Number",
    type: "Phone",
    form: "Customer",
    required: "Yes",
  },
  {
    id: "FLD-104",
    name: "Date of Birth",
    type: "Date",
    form: "Employee",
    required: "No",
  },
  {
    id: "FLD-105",
    name: "Address",
    type: "Textarea",
    form: "Customer",
    required: "Yes",
  },
]

// Mock data for forms (for dropdown)
const formOptions = ["Employee", "Contact", "Customer", "Supplier", "Contractor"]

// Mock data for field types (for dropdown)
const fieldTypeOptions = ["Text", "Email", "Phone", "Date", "Textarea", "Number", "Select", "Checkbox", "Radio"]

export default function FormFieldPage() {
  const { toast } = useToastContext()
  const [formFields, setFormFields] = useState(initialFormFields)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentField, setCurrentField] = useState<any>(null)

  // Filter form fields based on search term
  const filteredFields = formFields.filter(
    (field) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.form.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddField = (data: any) => {
    // Generate a new ID
    const newId = `FLD-${106 + formFields.length - 5}`

    // Create new form field object
    const newField = {
      id: newId,
      name: data.name,
      type: data.type,
      form: data.form,
      required: data.required ? "Yes" : "No",
    }

    // Add to form fields array
    setFormFields([...formFields, newField])

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleEditField = (data: any) => {
    // Update form field in the array
    const updatedFields = formFields.map((field) =>
      field.id === data.id
        ? {
            ...field,
            name: data.name,
            type: data.type,
            form: data.form,
            required: data.required ? "Yes" : "No",
          }
        : field,
    )

    setFormFields(updatedFields)

    // Return a promise to simulate async operation
    return Promise.resolve()
  }

  const handleDeleteField = (id: string) => {
    // Remove form field from the array
    setFormFields(formFields.filter((field) => field.id !== id))

    // Show success toast
    toast.success("Form Field Deleted", "Form field has been deleted successfully")
  }

  const handleView = (field: any) => {
    setCurrentField(field)
    setIsViewModalOpen(true)
  }

  const handleEdit = (field: any) => {
    setCurrentField(field)
    setIsEditModalOpen(true)
  }

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-medium flex items-center">
          <FormInput className="h-5 w-5 mr-2" />
          Form Field Management
        </h1>
        <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Form Field
        </Button>
      </div>

      <div className="bg-white rounded-b-lg p-6 shadow-md">
        <div className="mb-4 flex">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search form fields..."
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
                  Field ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Field Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Field Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Form
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Required
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
              {filteredFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{field.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.form}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.required}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(field)} className="text-red-600 hover:text-red-900 mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleView(field)} className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Field Modal */}
      <CrudModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Form Field"
        mode="add"
        itemType="Form Field"
        onSave={handleAddField}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Field Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="type">Field Type</Label>
            <Select name="type">
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="form">Form</Label>
            <Select name="form">
              <SelectTrigger>
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent>
                {formOptions.map((form) => (
                  <SelectItem key={form} value={form}>
                    {form}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="required" name="required" />
            <Label htmlFor="required">Required Field</Label>
          </div>
        </div>
      </CrudModal>

      {/* Edit Form Field Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Form Field"
        mode="edit"
        itemType="Form Field"
        initialData={currentField}
        onSave={handleEditField}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="id">Field ID</Label>
            <Input id="id" name="id" defaultValue={currentField?.id} disabled />
          </div>
          <div>
            <Label htmlFor="name">Field Name</Label>
            <Input id="name" name="name" defaultValue={currentField?.name} required />
          </div>
          <div>
            <Label htmlFor="type">Field Type</Label>
            <Select name="type" defaultValue={currentField?.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="form">Form</Label>
            <Select name="form" defaultValue={currentField?.form}>
              <SelectTrigger>
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent>
                {formOptions.map((form) => (
                  <SelectItem key={form} value={form}>
                    {form}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="required" name="required" defaultChecked={currentField?.required === "Yes"} />
            <Label htmlFor="required">Required Field</Label>
          </div>
        </div>
      </CrudModal>

      {/* View Form Field Modal */}
      <CrudModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Form Field Details"
        mode="view"
        itemType="Form Field"
      >
        {currentField && (
          <ViewDetails
            details={[
              { label: "Field ID", value: currentField.id },
              { label: "Field Name", value: currentField.name },
              { label: "Field Type", value: currentField.type },
              { label: "Form", value: currentField.form },
              { label: "Required", value: currentField.required },
            ]}
          />
        )}
      </CrudModal>
    </div>
  )
}
