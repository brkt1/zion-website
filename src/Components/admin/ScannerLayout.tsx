import { ReactNode } from 'react';

interface ScannerLayoutProps {
  children: ReactNode;
}

const ScannerLayout = ({ children }: ScannerLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-20 md:pb-0">
      {children}
    </div>
  );
};

export default ScannerLayout;

