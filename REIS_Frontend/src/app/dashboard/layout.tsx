// app/auth/layout.tsx
"use client"
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import logo from '@/app/favicon.ico'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { ModeToggle } from '@/components/theme_button'

export default function DashboardLayout({
children,
}: {
children: React.ReactNode
}) {
const handleLogOut = () => {
    localStorage.removeItem('user_id');
    window.location.href = '/auth/login';
}
return (
    <SidebarProvider>
        <AppSidebar/>
        {/* <Navbar/> */}
        <div className="flex flex-col w-screen">
        <SidebarInset className="flex flex-row py-5 items-center justify-between px-4 fixed top-0 max-w-[95%] ">
            <div className="flex items-center space-x-4">
            <SidebarTrigger/>
                
                <h1 className="text-2xl font-bold">I.D.A.R.A</h1>
            </div>
            <NavigationMenu className="hidden md:flex fixed right-0">
                <NavigationMenuList className="flex space-x-4">
                    <NavigationMenuItem className=" hover:text-gray-900">
                        <ModeToggle />
                    </NavigationMenuItem>
                    {/* <NavigationMenuItem className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 cursor-pointer">
                        <NavigationMenuLink href="/dashboard">Dashboard</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 cursor-pointer">
                        <NavigationMenuLink href="/dashboard/settings">Disaster</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 cursor-pointer">
                        <NavigationMenuLink href="/dashboard/profile">Reports</NavigationMenuLink>
                    </NavigationMenuItem> */}
                    
                    <NavigationMenuItem className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 cursor-pointer">
                        <NavigationMenuLink onClick={handleLogOut} >Logout</NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </SidebarInset>
        <hr className="border-b border-gray-200 dark:border-gray-700" />
        <main className='mt-20 h-[100svh] overflow-auto '>
            {children}
        </main>
        </div>
    </SidebarProvider>
)
}
