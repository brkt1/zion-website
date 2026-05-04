import { lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SkipToContent from "../ui/SkipToContent";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import ConversionNudge from "../ui/ConversionNudge";

// Lazy load Footer since it's conditionally rendered and not needed on homepage
const Footer = lazy(() => import("./Footer"));

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isRegistrationPage = location.pathname === "/expo-registration" || location.pathname === "/masterclass-registration";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <SkipToContent />
      {!isRegistrationPage && <Header />}
      <main 
        id="main-content" 
        className="flex-grow" 
        role="main"
        aria-label="Main content"
      >
        <Outlet />
      </main>
      {!isAdminPage && <ConversionNudge />}
      {!isHomePage && !isRegistrationPage && (
        <Suspense fallback={<div className="h-24" />}>
          <Footer />
        </Suspense>
      )}
      {/* Mobile Bottom Navigation - hidden on registration pages */}
      {!isRegistrationPage && <MobileBottomNav />}
    </div>
  );
};

export default Layout;

