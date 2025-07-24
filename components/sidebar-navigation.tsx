"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, CreditCard, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react"

const Icons = {
  FileText,
  CreditCard,
}

interface SubMenuItem {
  name: string
  href: string
  icon?: keyof typeof Icons
}

interface MenuSection {
  title: string
  items: SubMenuItem[]
}

interface SidebarNavigationProps {
  moduleName: string
  sections: MenuSection[]
}

export default function SidebarNavigation({ moduleName, sections }: SidebarNavigationProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(sections.map((section) => section.title))

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle) ? prev.filter((title) => title !== sectionTitle) : [...prev, sectionTitle],
    )
  }

  return (
    <div className="w-64 bg-white border-r h-full overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium">{moduleName}</h2>
        <Link href="/admin" className="text-red-600 hover:text-red-800 flex items-center text-sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Dashboard
        </Link>
      </div>
      <div className="p-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span>{section.title}</span>
              {expandedSections.includes(section.title) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedSections.includes(section.title) && (
              <div className="mt-1 ml-2 space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm rounded-md ${
                        isActive ? "bg-red-50 text-red-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon && Icons[item.icon] && React.createElement(Icons[item.icon], { className: "h-4 w-4 mr-2" })}

                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
