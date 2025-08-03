import React from 'react';
import {
  Home,
  BarChart3,
  ShoppingCart,
  Calendar,
  UtensilsCrossed,
  FileText,
  Users,
  Plus,
  TrendingUp,
  UserCog,
  GraduationCap,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/orders', label: 'Pesanan Saya', icon: ShoppingCart },
    { path: '/children', label: 'Data Anak', icon: Users },
    { path: '/batch-orders', label: 'Pesanan Batch', icon: Calendar },
    { path: '/profile', label: 'Profile Saya', icon: User },
    { path: '/admin', label: 'Admin', icon: BarChart3 },
    { path: '/cashier', label: 'Cashier', icon: UserCog },
  ];

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="https://lh3.googleusercontent.com/d/1ZDW1GB_y68htjrMiZHZQ478Eu0j_DBv-=s360?authuser=0" 
            alt="Dapoer At-Tauhid Logo" 
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-bold text-orange-500">
            Dapoer At-Tauhid
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 ${location.pathname === item.path ? 'bg-gray-100 font-medium' : ''}`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={""} alt={"User"} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    User
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Saya</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-2 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 ${location.pathname === item.path ? 'bg-gray-100 font-medium' : ''}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <Button variant="outline" onClick={handleSignOut}>
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
