"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Search, User, LogOut, Settings, Package, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { UserPayload } from "@/hooks/useRequireAuth"

type MenuItem = {
  title: string;
  url?: string;
  icon?: any;
  min_permission: number;
  action?: 'logout' | 'login' | 'register';
  isButton?: boolean;
  isDanger?: boolean;
  children?: MenuItem[];
}

export function Navbar() {
  const [isLogged, setIsLogged] = useState(false)
  const [userData, setUserData] = useState<UserPayload | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<{[key: string]: boolean}>({})
  const [isMounted, setIsMounted] = useState(false)

  const toggleSubmenu = (title: string) => {
      setOpenSubmenus(prev => ({...prev, [title]: !prev[title]}))
  }

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token")
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedPayload = JSON.parse(jsonPayload);
            
            setUserData(decodedPayload);
            setIsLogged(true);
        } catch (e) {
            setIsLogged(false);
            setUserData(null);
        }
    } else {
      setIsLogged(false);
      setUserData(null);
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLogged(false)
    setUserData(null)
    setIsMobileMenuOpen(false)
    router.push("/login")
  }

  // ไม่แสดง Navbar ใหนหน้า Authentication (Login, Register)
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // --- SKELETON NAVBAR LOADING STATE ---
  if (!isMounted) {
    return (
      <header className="w-full relative">
        {/* Desktop Skeleton */}
        <div className="hidden md:block border-b border-border bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                 <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                 <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="flex flex-1 max-w-xl mx-8">
              <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
              <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        </div>
        {/* Mobile Skeleton */}
        <div className="md:hidden bg-secondary text-secondary-foreground z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-10 w-10 bg-primary/20 animate-pulse rounded-md" />
          </div>
        </div>
      </header>
    );
  }

  // --- MENU CONFIGURATION ---
  const userMenus: MenuItem[] = [
    { title: 'บัญชีของฉัน', url: '/dashboard', icon: User, min_permission: 1 },
    { 
      title: 'ตั้งค่าระบบ', min_permission: 2, icon: Settings,
      children: [
        { title: 'จัดการสินค้า', url: '/backend/setting/products', icon: Package, min_permission: 2 },
      ]
    },
    { title: 'Logout', action: 'logout', icon: LogOut, min_permission: 0, isButton: true, isDanger: true }
  ];

  const guestMenus: MenuItem[] = [
    { title: 'Login', action: 'login', min_permission: 0, isButton: true },
    { title: 'Register', action: 'register', min_permission: 0, isButton: true },
  ];

  // กรองเมนูที่เข้าเกณฑ์ Permission ของ User
  const currentMenus = isLogged 
    ? userMenus.filter(m => m.min_permission <= (userData?.permission_id || 0)) 
    : guestMenus.filter(m => m.min_permission <= 0);

  return (
    <header className="w-full relative">
      {/* 1. Navbar สำหรับจอใหญ่ (iPad ขึ้นไป) */}
      <div className="hidden md:block border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">GoNext</h1>
              <p className="text-xs text-primary">Microservices Stack</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex flex-1 max-w-xl mx-8">
            <div className="flex w-full">
              <Input
                type="text"
                placeholder="ค้นหา..."
                className="rounded-none rounded-l-md flex-1 border-r-0"
              />
              <Button className="rounded-none rounded-r-md bg-primary hover:bg-primary/90 text-primary-foreground">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right Actions / Dynamic Menu Loop */}
          <div className="flex items-center gap-4">
            {currentMenus.map((item, idx) => {
                // 1. Render Submenu
                if (item.children) {
                    return (
                        <div key={idx} className="relative group cursor-pointer inline-flex items-center gap-1 text-foreground font-medium hover:text-primary transition-colors py-2">
                           {item.icon && <item.icon className="h-5 w-5" />}
                           <span>{item.title}</span>
                           <ChevronDown className="h-4 w-4" />
                           {/* ซ่อน Dropdown ไว้ โผล่มาตอน Hover */}
                           <div className="absolute top-full right-0 mt-0 w-48 bg-card border border-border shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {item.children.filter(child => child.min_permission <= (userData?.permission_id || 0)).map((child, cIdx) => (
                                    <Link key={cIdx} href={child.url!} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted text-card-foreground">
                                        {child.icon && <child.icon className="h-4 w-4" />}
                                        {child.title}
                                    </Link>
                                ))}
                           </div>
                        </div>
                    );
                }

                // 2. Render Buttons 
                if (item.isButton || item.action) {
                    if (item.action === 'logout') {
                        return (
                            <Button key={idx} variant={item.isDanger ? "outline" : "default"} onClick={handleLogout} className={item.isDanger ? "text-destructive hover:bg-destructive/10 border-destructive" : ""}>
                               {item.icon && <item.icon className="h-4 w-4 mr-2" />} {item.title}
                            </Button>
                        )
                    }
                    if (item.action === 'login') {
                         return <Button key={idx} variant="outline" onClick={() => router.push("/login")}>{item.title}</Button>
                    }
                    if (item.action === 'register') {
                         return <Button key={idx} onClick={() => router.push("/register")}>{item.title}</Button>
                    }
                }

                // 3. Render Normal Links
                return (
                    <Link key={idx} href={item.url!} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium">
                       {item.icon && <item.icon className="h-5 w-5" />}
                       <span>{item.title}</span>
                    </Link>
                )
            })}
          </div>
        </div>
      </div>
      
      {/* 2. Navigation Bar สำหรับจอแคบและมือถือ */}
      <div className="md:hidden bg-secondary text-secondary-foreground z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold">GoNext</h1>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-secondary/80"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* 3. Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-secondary-foreground/10 bg-secondary pb-3 px-4 pt-2">
            <div className="space-y-1">
               {currentMenus.map((item, idx) => {
                   if (item.children) {
                       return (
                           <div key={idx}>
                               <button onClick={() => toggleSubmenu(item.title)} className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-secondary-foreground hover:bg-secondary-foreground/10 rounded-md">
                                  <div className="flex items-center gap-2">
                                     {item.icon && <item.icon className="h-5 w-5" />} {item.title}
                                  </div>
                                  <ChevronDown className={`h-4 w-4 transition-transform ${openSubmenus[item.title] ? 'rotate-180' : ''}`} />
                               </button>
                               {/* Accordion Menu */}
                               {openSubmenus[item.title] && (
                                   <div className="pl-6 space-y-1 mt-1">
                                       {item.children.filter(c => c.min_permission <= (userData?.permission_id || 0)).map((child, cIdx) => (
                                           <Link 
                                             key={cIdx} 
                                             href={child.url!} 
                                             onClick={() => setIsMobileMenuOpen(false)}
                                             className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-foreground/10 rounded-md"
                                           >
                                             {child.icon && <child.icon className="h-4 w-4" />} {child.title}
                                           </Link>
                                       ))}
                                   </div>
                               )}
                           </div>
                       )
                   }
                   if (item.action === 'logout') {
                       return (
                           <button 
                             key={idx}
                             onClick={handleLogout} 
                             className="w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10 rounded-md text-left"
                           >
                             {item.icon && <item.icon className="h-5 w-5" />} {item.title}
                           </button>
                       )
                   }

                   // Map Normal Login/Register Action Links
                   const href = item.action === 'login' ? '/login' : item.action === 'register' ? '/register' : item.url;
                   return (
                       <Link 
                         key={idx}
                         href={href!} 
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="flex items-center gap-2 px-3 py-2 text-base font-medium text-secondary-foreground hover:bg-secondary-foreground/10 rounded-md"
                       >
                         {item.icon && <item.icon className="h-5 w-5" />} {item.title}
                       </Link>
                   )
               })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
