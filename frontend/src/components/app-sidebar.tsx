import {
  IconInnerShadowTop,
  IconPackage,
  IconReceipt,
  IconStar,
  IconMessage,
  IconGavel,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

interface SellerSidebarProps {
  activeTab: "products" | "sales" | "reviews" | "messages" | "auctions";
  onTabChange: (tab: "products" | "sales" | "reviews" | "messages" | "auctions") => void;
}

export function AppSidebar({ activeTab, onTabChange, ...props }: SellerSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const navItems = [
    {
      id: "products" as const,
      title: "Products",
      icon: IconPackage,
    },
    {
      id: "auctions" as const,
      title: "Auctions",
      icon: IconGavel,
    },
    {
      id: "sales" as const,
      title: "Sales",
      icon: IconReceipt,
    },
    {
      id: "reviews" as const,
      title: "Reviews",
      icon: IconStar,
    },
    {
      id: "messages" as const,
      title: "Messages",
      icon: IconMessage,
    },
  ];

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
                <span className="text-base font-semibold">Seller Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
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
