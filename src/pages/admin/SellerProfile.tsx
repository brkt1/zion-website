import { FaCheckCircle, FaEnvelope, FaPhone, FaTimesCircle } from 'react-icons/fa';
import SellerHeader from '../../Components/admin/SellerHeader';
import SellerLayout from '../../Components/admin/SellerLayout';
import { useSellerData } from '../../hooks/useSellerData';

const SellerProfile = () => {
  const { seller, user, salesStats, loading } = useSellerData();

  if (loading || !seller) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <SellerHeader seller={seller} user={user} title="Profile" />
      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{seller.name}</h2>
                <p className="text-yellow-100 text-sm mt-1">Commission Seller</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Account Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                  {seller.is_active ? (
                    <>
                      <FaCheckCircle className="text-green-600" size={16} />
                      <span className="font-semibold text-gray-900">Active</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-gray-400" size={16} />
                      <span className="font-semibold text-gray-900">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
              
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaEnvelope className="text-yellow-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{seller.email}</p>
                </div>
              </div>

              {seller.phone && (
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FaPhone className="text-yellow-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{seller.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sales Summary */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Summary</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                    <p className="text-xs text-gray-500 mb-1">Total Tickets Sold</p>
                    <p className="text-2xl font-bold text-gray-900">{salesStats.successfulTickets}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">Gross Commission</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesStats.totalCommission.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ETB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <p className="text-xs text-gray-500 mb-1">VAT (15%)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesStats.totalVAT.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ETB</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Net Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesStats.netCommission.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ETB (after VAT)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SellerLayout>
  );
};

export default SellerProfile;

