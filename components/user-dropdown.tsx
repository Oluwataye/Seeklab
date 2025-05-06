"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { logout, getUser } from "@/lib/auth"
import { useToastContext } from "@/components/toast-provider"

export default function UserDropdown() {
  const router = useRouter()
  const { toast } = useToastContext()
  const [isOpen, setIsOpen] = useState(false)
  // Get user data once during component initialization
  const [user] = useState(getUser)

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"
      >
        <span className="text-sm text-red-600">{user?.username?.charAt(0) || "U"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium">{user?.username || "User"}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || "user"}</p>
          </div>

          <a
            href="/admin/configuration/account"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </a>

          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
