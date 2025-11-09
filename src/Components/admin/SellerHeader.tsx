import { FaCheckCircle, FaSignOutAlt, FaTicketAlt, FaTimesCircle, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { CommissionSeller } from '../../types';

interface SellerHeaderProps {
  seller: CommissionSeller;
  user: any;
  title: string;
}

const SellerHeader = ({ seller, user, title }: SellerHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm md:bg-white/80 md:backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 md:pl-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 md:h-10 md:w-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
              <FaTicketAlt className="text-white" size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  seller.is_active 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {seller.is_active ? (
                    <FaCheckCircle size={10} />
                  ) : (
                    <FaTimesCircle size={10} />
                  )}
                  {seller.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden md:block">Welcome back, {seller.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <FaUser className="text-gray-400" size={14} />
                <span className="text-xs">{user?.email?.split('@')[0] || ''}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center h-9 w-9 md:h-auto md:w-auto md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
            >
              <FaSignOutAlt size={16} />
              <span className="hidden md:inline ml-2">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader;

