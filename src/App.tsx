import { Suspense, lazy } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminRoute from "./Components/admin/AdminRoute";
import Layout from "./Components/layout/Layout";
import ScrollToTop from "./Components/ScrollToTop";
import { LoadingState } from "./Components/ui/LoadingState";
import PWAInstallPrompt from "./Components/ui/PWAInstallPrompt";
import VisitTracker from "./Components/VisitTracker";

// Use React 18's startTransition for non-urgent updates
// This helps reduce main thread blocking

// Lazy load all route components for code splitting and faster initial load
const Home = lazy(() => import("./pages/Home"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Apply = lazy(() => import("./pages/Apply"));
const Travel = lazy(() => import("./pages/Travel"));
const Community = lazy(() => import("./pages/Community"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));

// Admin pages - lazy loaded
const AdminRedirect = lazy(() => import("./pages/admin/AdminRedirect"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const CommissionSellers = lazy(() => import("./pages/admin/CommissionSellers"));
const SellerDashboard = lazy(() => import("./pages/admin/SellerDashboard"));
const SellerSales = lazy(() => import("./pages/admin/SellerSales"));
const SellerGoals = lazy(() => import("./pages/admin/SellerGoals"));
const SellerProfile = lazy(() => import("./pages/admin/SellerProfile"));
const ScannerDashboard = lazy(() => import("./pages/admin/ScannerDashboard"));
const TicketScanners = lazy(() => import("./pages/admin/TicketScanners"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminDestinations = lazy(() => import("./pages/admin/Destinations"));
const AdminGallery = lazy(() => import("./pages/admin/Gallery"));
const AdminAbout = lazy(() => import("./pages/admin/About"));
const AdminHome = lazy(() => import("./pages/admin/Home"));
const AdminContact = lazy(() => import("./pages/admin/Contact"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const VerifyTicket = lazy(() => import("./pages/admin/VerifyTicket"));
const Applications = lazy(() => import("./pages/admin/Applications"));

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <VisitTracker />
      <PWAInstallPrompt />
      <Routes>
        {/* Public Routes */}
        <Route path="/*" element={
          <Layout>
            <Suspense fallback={<LoadingState message="Loading page..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/travel" element={<Travel />} />
                <Route path="/community" element={<Community />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
                <Route path="/payment/failed" element={<PaymentFailed />} />
              </Routes>
            </Suspense>
          </Layout>
        } />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<LoadingState message="Loading..." />}>
              <AdminRedirect />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/login" 
          element={
            <Suspense fallback={<LoadingState message="Loading login..." />}>
              <AdminLogin />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/seller-dashboard" 
          element={
            <Suspense fallback={<LoadingState message="Loading..." />}>
              <SellerDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/seller-sales" 
          element={
            <Suspense fallback={<LoadingState message="Loading..." />}>
              <SellerSales />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/seller-goals" 
          element={
            <Suspense fallback={<LoadingState message="Loading..." />}>
              <SellerGoals />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/seller-profile" 
          element={
            <Suspense fallback={<LoadingState message="Loading..." />}>
              <SellerProfile />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/scanner-dashboard" 
          element={
            <Suspense fallback={<LoadingState message="Loading..." />}>
              <ScannerDashboard />
            </Suspense>
          } 
        />
        
        {/* Admin-only routes - protected by AdminRoute */}
        <Route element={<AdminRoute />}>
          <Route 
            path="/admin/commission-sellers" 
            element={
              <Suspense fallback={<LoadingState message="Loading..." />}>
                <CommissionSellers />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ticket-scanners" 
            element={
              <Suspense fallback={<LoadingState message="Loading..." />}>
                <TicketScanners />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <Suspense fallback={<LoadingState message="Loading dashboard..." />}>
                <AdminDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/events" 
            element={
              <Suspense fallback={<LoadingState message="Loading events..." />}>
                <AdminEvents />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/categories" 
            element={
              <Suspense fallback={<LoadingState message="Loading categories..." />}>
                <AdminCategories />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/destinations" 
            element={
              <Suspense fallback={<LoadingState message="Loading destinations..." />}>
                <AdminDestinations />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/gallery" 
            element={
              <Suspense fallback={<LoadingState message="Loading gallery..." />}>
                <AdminGallery />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/about" 
            element={
              <Suspense fallback={<LoadingState message="Loading..." />}>
                <AdminAbout />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/home" 
            element={
              <Suspense fallback={<LoadingState message="Loading..." />}>
                <AdminHome />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/contact" 
            element={
              <Suspense fallback={<LoadingState message="Loading..." />}>
                <AdminContact />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <Suspense fallback={<LoadingState message="Loading settings..." />}>
                <AdminSettings />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/verify" 
            element={
              <Suspense fallback={<LoadingState message="Loading..." />}>
                <VerifyTicket />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/applications" 
            element={
              <Suspense fallback={<LoadingState message="Loading..." />}>
                <Applications />
              </Suspense>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
