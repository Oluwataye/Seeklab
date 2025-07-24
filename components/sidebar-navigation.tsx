import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { CalendarDays, CalendarClock, CalendarRange } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Calendar Management",
  description: "Calendar Management System",
}

const calendarSections = [
  {
    title: "Calendar Management",
    items: [
      { name: "Events", href: "/admin/calendar/events", icon: "CalendarDays" },
      { name: "Appointments", href: "/admin/calendar/appointments", icon: "CalendarClock" },
      { name: "Schedule", href: "/admin/calendar/schedule", icon: "CalendarRange" },
    ],
  },
]

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ml-[150px] flex">
      <SidebarNavigation moduleName="Calendar Management" sections={calendarSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
