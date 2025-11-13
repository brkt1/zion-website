import { lazy, ReactNode, Suspense } from "react";
import { useLocation } from "react-router-dom";
import SkipToContent from "../ui/SkipToContent";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";

// Lazy load Footer since it's conditionally rendered and not needed on homepage
const Footer = lazy(() => import("./Footer"));

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <SkipToContent />
      <Header />
      <main 
        id="main-content" 
        className="flex-grow" 
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
      {!isHomePage && (
        <Suspense fallback={<div className="h-24" />}>
          <Footer />
        </Suspense>
      )}
      {/* Mobile Bottom Navigation - shown on all pages */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;

