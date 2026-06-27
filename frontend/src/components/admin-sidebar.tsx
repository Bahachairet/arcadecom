import {
  IconLayoutDashboard,
  IconTags,
  IconUsers,
  IconUserCircle,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/context/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Overview", url: "overview", icon: IconLayoutDashboard },
  { title: "Users", url: "users", icon: IconUserCircle },
  { title: "Categories", url: "categories", icon: IconTags },
  { title: "Seller Applications", url: "sellers", icon: IconUsers },
]

export function AdminSidebar({
  activeTab,
  onTabChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const { user } = useAuth()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">VAULT-X Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={activeTab === item.url}
                  onClick={() => onTabChange(item.url)}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.displayName,
              email: user.email,
              avatar: "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
