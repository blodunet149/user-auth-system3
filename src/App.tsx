import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import AdminNavbar from '@/components/AdminNavbar';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Children from '@/pages/Children';
import Orders from '@/pages/Orders';
import BatchOrders from '@/pages/BatchOrders';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import OrderManagement from '@/pages/admin/OrderManagement';
import FoodManagement from '@/pages/admin/FoodManagement';
import UserManagement from '@/pages/admin/UserManagement';
import StudentManagement from '@/pages/admin/StudentManagement';
import { OrderRecap } from '@/pages/admin/OrderRecap';
import Reports from '@/pages/admin/Reports';
import ScheduleManagement from '@/pages/admin/ScheduleManagement';
import PopulateDailyMenus from '@/pages/admin/PopulateDailyMenus';
import CashierDashboard from '@/pages/cashier/CashierDashboard';
import CashierReports from '@/pages/cashier/CashierReports';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Layout component with proper navbar
const Layout = ({ children, isAdminRoute }: { children: React.ReactNode; isAdminRoute?: boolean }) => {
  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      {children}
    </>
  );
};

// App routes component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/children" element={<Layout><Children /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />
      <Route path="/batch-orders" element={<Layout><BatchOrders /></Layout>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<Layout isAdminRoute><AdminDashboard /></Layout>} />
      <Route path="/admin/orders" element={<Layout isAdminRoute><OrderManagement /></Layout>} />
      <Route path="/admin/food-management" element={<Layout isAdminRoute><FoodManagement /></Layout>} />
      <Route path="/admin/user-management" element={<Layout isAdminRoute><UserManagement /></Layout>} />
      <Route path="/admin/student-management" element={<Layout isAdminRoute><StudentManagement /></Layout>} />
      <Route path="/admin/recap" element={<Layout isAdminRoute><OrderRecap /></Layout>} />
      <Route path="/admin/reports" element={<Layout isAdminRoute><Reports /></Layout>} />
      <Route path="/admin/schedule" element={<Layout isAdminRoute><ScheduleManagement /></Layout>} />
      <Route path="/admin/populate-menus" element={<Layout isAdminRoute><PopulateDailyMenus /></Layout>} />
      
      {/* Cashier Routes */}
      <Route path="/cashier" element={<Layout><CashierDashboard /></Layout>} />
      <Route path="/cashier/reports" element={<Layout><CashierReports /></Layout>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
