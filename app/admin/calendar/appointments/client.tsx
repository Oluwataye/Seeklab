"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrudModal } from "@/components/crud-modal"

export function AddAppointmentButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    // Handle form submission logic here
    console.log("Form submitted:", Object.fromEntries(formData.entries()))
    setIsModalOpen(false)
  }

  return (
    <>
      <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-1" /> Add Appointment
      </Button>

      {isModalOpen && (
        <CrudModal
          title="Add Appointment"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          mode="add"
          itemType="Appointment"
        >
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Appointment title"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="client" className="text-right">
                Client/Contact
              </label>
              <input
                id="client"
                name="client"
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Client name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="time" className="text-right">
                Time
              </label>
              <input
                id="time"
                name="time"
                type="time"
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="assignedTo" className="text-right">
                Assigned To
              </label>
              <input
                id="assignedTo"
                name="assignedTo"
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Staff member"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="pending"
                required
              >
                <option value="confirmed">Confirmed</option>
                <option value="scheduled">Scheduled</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Additional notes"
              />
            </div>
          </div>
        </CrudModal>
      )}
    </>
  )
}
