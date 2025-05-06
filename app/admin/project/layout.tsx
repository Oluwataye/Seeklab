import type React from "react"
import type { Metadata } from "next"
import SidebarNavigation from "@/components/sidebar-navigation"
import { Briefcase, CheckSquare, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "OSOFT - Project Management",
  description: "Project Management System",
}

const projectSections = [
  {
    title: "Project Management",
    items: [
      { name: "Projects", href: "/admin/project/projects", icon: Briefcase },
      { name: "Tasks", href: "/admin/project/tasks", icon: CheckSquare },
      { name: "Teams", href: "/admin/project/teams", icon: Users },
    ],
  },
]

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <SidebarNavigation moduleName="Project Management" sections={projectSections} />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
