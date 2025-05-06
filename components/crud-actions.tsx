"use client"

import { useState } from "react"
import { Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/modal"
import { useToastContext } from "@/components/toast-provider"

interface CrudActionsProps {
  onEdit?: () => void
  onView?: () => void
  onDelete?: () => void
  item?: any
  itemType?: string
}

export function CrudActions({ onEdit, onView, onDelete, item, itemType = "item" }: CrudActionsProps) {
  const { toast } = useToastContext()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      toast.info(`Edit ${itemType}`, `Editing functionality for ${itemType} will be implemented soon.`)
    }
  }

  const handleView = () => {
    if (onView) {
      onView()
    } else {
      toast.info(`View ${itemType}`, `Viewing functionality for ${itemType} will be implemented soon.`)
    }
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete()
    } else {
      toast.success(`${itemType} Deleted`, `${itemType} has been deleted successfully.`)
    }
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900 mr-1" onClick={handleEdit}>
          <Edit className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 mr-1" onClick={handleView}>
          <Eye className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete ${itemType}`}
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.</p>
      </Modal>
    </>
  )
}

export default CrudActions
