"use client"
import { Calendar, Home, Inbox, Map, Search, Settings, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

import {
Sidebar,
SidebarContent,
SidebarFooter,
SidebarGroup,
SidebarGroupContent,
SidebarGroupLabel,
SidebarMenu,
SidebarMenuButton,
SidebarMenuItem,
SidebarMenuSub,
SidebarMenuSubButton,
SidebarMenuSubItem,
SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const disasterItems = [
  {
    title: "Earthquake",
    url: "/dashboard/disasters?tab=earthquake",
  },
  {
    title: "Flood",
    url: "/dashboard/disasters?tab=flood",
  },
  {
    title: "Wildfire",
    url: "/dashboard/disasters?tab=wildfire",
  },
]

export function AppSidebar() {
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  const userId = localStorage.getItem('user_id');
  setIsAuthenticated(!!userId);
}, []);

return (
    <Sidebar collapsible="icon">
    <SidebarContent>
        <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <a href="/dashboard">
                    <Home />
                    <span>Home</span>
                    </a>
                </SidebarMenuButton>
                </SidebarMenuItem>
            
            {isAuthenticated && (
                <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <a href="/dashboard/reports">
                    <Calendar />
                    <span>Reports</span>
                    </a>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Map />
                    <span>Disaster Maps</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {disasterItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={item.url}>
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            </SidebarMenu>
        </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="flex items-center justify-between fixed bottom-0 left-0">
        
        <SidebarGroupContent>
            <SidebarTrigger/>
        </SidebarGroupContent>
        </SidebarFooter>
    </SidebarContent>
    </Sidebar>
)
}
