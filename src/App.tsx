import { Suspense, lazy } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminRoute from "./Components/admin/AdminRoute";
import Layout from "./Components/layout/Layout";
import PageTracker from "./Components/PageTracker";
import ScrollToTop from "./Components/ScrollToTop";
import { BrowserCompatibility } from "./Components/ui/BrowserCompatibility";
import { LoadingState } from "./Components/ui/LoadingState";

import VisitTracker from "./Components/VisitTracker";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Use React 18's startTransition for non-urgent updates
// This helps reduce main thread blocking

// Lazy load all route components for code splitting and faster initial load
const Home = lazy(() => import("./pages/Home"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Apply = lazy(() => import("./pages/Apply"));
const Community = lazy(() => import("./pages/Community"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ExpoInfo = lazy(() => import("./pages/ExpoInfo"));
const ExpoRegistration = lazy(() => import("./pages/ExpoRegistration"));
const Certification = lazy(() => import("./pages/Certification"));
const Masterclass = lazy(() => import("./pages/Masterclass"));
const MasterclassRegistration = lazy(() => import("./pages/MasterclassRegistration"));


// Game pages - hidden routes (no navigation links)
const DiceRoller = lazy(() => import("./pages/games/DiceRoller"));

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
const AdminExpoApplications = lazy(() => import("./pages/admin/ExpoApplications"));
const AdminMasterclassReservations = lazy(() => import("./pages/admin/MasterclassReservations"));
const MasterclassDashboard = lazy(() => import("./pages/admin/MasterclassDashboard"));
const RepresentativeDashboard = lazy(() => import("./pages/admin/RepresentativeDashboard"));




function App() {
  return (
    <Router>
      <BrowserCompatibility />
      <ScrollToTop />
      <PageTracker />
      <VisitTracker />


      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={
            <Suspense fallback={<LoadingState message="Loading..." />}>
              <Home />
            </Suspense>
          } />
          <Route path="/events" element={
            <Suspense fallback={<LoadingState />}>
              <Events />
            </Suspense>
          } />
          <Route path="/events/:id" element={
            <Suspense fallback={<LoadingState />}>
              <EventDetail />
            </Suspense>
          } />
          <Route path="/community" element={
            <Suspense fallback={<LoadingState />}>
              <Community />
            </Suspense>
          } />
          <Route path="/about" element={
            <Suspense fallback={<LoadingState />}>
              <About />
            </Suspense>
          } />
          <Route path="/contact" element={
            <Suspense fallback={<LoadingState />}>
              <Contact />
            </Suspense>
          } />
          <Route path="/apply" element={
            <Suspense fallback={<LoadingState />}>
              <Apply />
            </Suspense>
          } />
          <Route path="/expo-info" element={
            <Suspense fallback={<LoadingState />}>
              <ExpoInfo />
            </Suspense>
          } />
          <Route path="/expo-registration" element={
            <Suspense fallback={<LoadingState />}>
              <ExpoRegistration />
            </Suspense>
          } />
          <Route path="/certification" element={
            <Suspense fallback={<LoadingState />}>
              <Certification />
            </Suspense>
          } />
          <Route path="/masterclass" element={
            <Suspense fallback={<LoadingState />}>
              <Masterclass />
            </Suspense>
          } />
          <Route path="/masterclass-registration" element={
            <Suspense fallback={<LoadingState />}>
              <MasterclassRegistration />
            </Suspense>
          } />
          <Route path="/payment/success" element={
            <Suspense fallback={<LoadingState />}>
              <PaymentSuccess />
            </Suspense>
          } />
          <Route path="/payment/callback" element={
            <Suspense fallback={<LoadingState />}>
              <PaymentCallback />
            </Suspense>
          } />
          <Route path="/payment/failed" element={
            <Suspense fallback={<LoadingState />}>
              <PaymentFailed />
            </Suspense>
          } />
          
          <Route path="/games/dice-roller" element={
            <Suspense fallback={<LoadingState />}>
              <DiceRoller />
            </Suspense>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Route>
        

        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<LoadingState />}>
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
            <Suspense fallback={<LoadingState />}>
              <SellerDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/seller-sales" 
          element={
            <Suspense fallback={<LoadingState />}>
              <SellerSales />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/seller-goals" 
          element={
            <Suspense fallback={<LoadingState />}>
              <SellerGoals />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/seller-profile" 
          element={
            <Suspense fallback={<LoadingState />}>
              <SellerProfile />
            </Suspense>
          } 
        />
        <Route 
          path="/admin/scanner-dashboard" 
          element={
            <Suspense fallback={<LoadingState />}>
              <ScannerDashboard />
            </Suspense>
          } 
        />
        
        <Route element={<AdminRoute />}>
          <Route 
            path="/admin/sponsorship-department" 
            element={
              <Suspense fallback={<LoadingState message="Loading intelligence..." />}>
                <RepresentativeDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/commission-sellers" 
            element={
              <Suspense fallback={<LoadingState />}>
                <CommissionSellers />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ticket-scanners" 
            element={
              <Suspense fallback={<LoadingState />}>
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
              <Suspense fallback={<LoadingState />}>
                <AdminAbout />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/home" 
            element={
              <Suspense fallback={<LoadingState />}>
                <AdminHome />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/contact" 
            element={
              <Suspense fallback={<LoadingState />}>
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
              <Suspense fallback={<LoadingState />}>
                <VerifyTicket />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/applications" 
            element={
              <Suspense fallback={<LoadingState />}>
                <Applications />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/expo-applications" 
            element={
              <Suspense fallback={<LoadingState />}>
                <AdminExpoApplications />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/masterclass-dashboard" 
            element={
              <Suspense fallback={<LoadingState message="Loading intelligence..." />}>
                <MasterclassDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/masterclass-reservations" 
            element={
              <Suspense fallback={<LoadingState />}>
                <AdminMasterclassReservations />
              </Suspense>
            } 
          />
          
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
