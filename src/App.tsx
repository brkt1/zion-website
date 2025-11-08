import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./Components/layout/Layout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EventDetail from "./pages/EventDetail";
import Events from "./pages/Events";
import Home from "./pages/Home";
import PaymentCallback from "./pages/PaymentCallback";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminAbout from "./pages/admin/About";
import AdminRedirect from "./pages/admin/AdminRedirect";
import AdminCategories from "./pages/admin/Categories";
import AdminContact from "./pages/admin/Contact";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminDestinations from "./pages/admin/Destinations";
import AdminEvents from "./pages/admin/Events";
import AdminGallery from "./pages/admin/Gallery";
import AdminHome from "./pages/admin/Home";
import AdminLogin from "./pages/admin/Login";
import AdminSettings from "./pages/admin/Settings";
import VerifyTicket from "./pages/admin/VerifyTicket";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
            </Routes>
          </Layout>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/destinations" element={<AdminDestinations />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/admin/about" element={<AdminAbout />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/contact" element={<AdminContact />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/verify" element={<VerifyTicket />} />
      </Routes>
    </Router>
  );
}

export default App;
