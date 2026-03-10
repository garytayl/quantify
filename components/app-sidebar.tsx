"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconRobot,
  IconSearch,
  IconSettings,
  IconSword,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: "Trader",
    email: "you@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Scanner", url: "/scanner", icon: IconChartBar },
    { title: "Options Chain", url: "/options", icon: IconTrendingUp },
    { title: "Journal", url: "/journal", icon: IconRobot },
    { title: "Risk", url: "/risk", icon: IconSword },
  ],
  navClouds: [],
  navSecondary: [
    { title: "Settings", url: "/dashboard", icon: IconSettings },
    { title: "Get Help", url: "/dashboard", icon: IconHelp },
    { title: "Search", url: "/scanner", icon: IconSearch },
  ],
  documents: [
    { name: "Open Positions", url: "/options", icon: IconTrendingUp },
    { name: "Trade History", url: "/journal", icon: IconChartBar },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Quantify</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
