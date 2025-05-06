"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToastContext } from "@/components/toast-provider"
import { Modal } from "@/components/modal"

// Update the CrudModalProps interface to include the fields prop
interface CrudModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  mode?: "add" | "edit" | "view"
  itemType?: string
  onSave?: (data: any) => void
  onSubmit?: (formData: FormData) => Promise<void> | void
  initialData?: any
  children?: React.ReactNode
  fields?: Array<{
    name: string
    label: string
    type: string
    required?: boolean
    options?: Array<{ value: string; label: string }>
  }>
}

// Update the CrudModal component to render form fields if provided
export function CrudModal({
  isOpen,
  onClose,
  title,
  mode = "add",
  itemType = "Item",
  onSave,
  onSubmit,
  initialData,
  children,
  fields,
}: CrudModalProps) {
  const { toast } = useToastContext()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset submitting state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "view") {
      onClose()
      return
    }

    setIsSubmitting(true)

    try {
      // Get form data from the form element
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      // If onSubmit is provided, use it directly with FormData
      if (onSubmit) {
        await onSubmit(formData)
      }
      // Otherwise use the older onSave method with object data
      else if (onSave) {
        // Convert FormData to object
        const data: Record<string, any> = {}
        formData.forEach((value, key) => {
          data[key] = value
        })

        // If there's an ID in initialData, include it
        if (initialData?.id) {
          data.id = initialData.id
        }

        await onSave(data)
      }

      // Show success toast
      toast.success(
        `${itemType} ${mode === "add" ? "Added" : "Updated"}`,
        `${itemType} has been successfully ${mode === "add" ? "added" : "updated"}.`,
      )

      onClose()
    } catch (error) {
      console.error("Error saving data:", error)
      toast.error(
        `Failed to ${mode === "add" ? "add" : "update"} ${itemType}`,
        error instanceof Error ? error.message : "An unknown error occurred",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render form fields based on the fields prop
  const renderFormFields = () => {
    if (!fields) return children

    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                defaultValue={initialData?.[field.name] || ""}
                required={field.required}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select {field.label}
                </option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                defaultValue={initialData?.[field.name] || ""}
                required={field.required}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                defaultValue={initialData?.[field.name] || ""}
                required={field.required}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            )}
          </div>
        ))}
        {children}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        mode === "view" ? (
          <Button onClick={onClose}>Close</Button>
        ) : (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="crud-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">{mode === "add" ? "Adding..." : "Saving..."}</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : mode === "add" ? (
                "Add"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )
      }
    >
      <form id="crud-form" onSubmit={handleSave} className="space-y-4">
        {renderFormFields()}
      </form>
    </Modal>
  )
}

// Also export as default for backward compatibility
export default CrudModal
