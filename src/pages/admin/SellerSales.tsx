import { FaCheckCircle, FaTicketAlt, FaTimesCircle } from 'react-icons/fa';
import SellerHeader from '../../Components/admin/SellerHeader';
import SellerLayout from '../../Components/admin/SellerLayout';
import { useSellerData } from '../../hooks/useSellerData';

const SellerSales = () => {
  const { seller, user, tickets, loading, loadingTickets } = useSellerData();

  if (loading || !seller) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sales data...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <SellerHeader seller={seller} user={user} title="Sales" />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Sales History */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Sales History</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">View all tickets you have sold</p>
          </div>
          {loadingTickets ? (
            <div className="p-12">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <FaTicketAlt className="mx-auto mb-4 text-gray-300" size={40} />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No tickets sold yet</h3>
              <p className="text-xs md:text-sm text-gray-500">Start selling tickets to see your sales history here!</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {tickets.map((ticket) => {
                  const amount = typeof ticket.amount === 'number' ? ticket.amount : parseFloat(String(ticket.amount)) || 0;
                  const ticketTotal = amount * ticket.quantity;
                  let commission = 0;
                  if (seller) {
                    if (seller.commission_type === 'percentage') {
                      commission = (ticketTotal * seller.commission_rate) / 100;
                    } else {
                      commission = seller.commission_rate * ticket.quantity;
                    }
                  }
                  const statusColors = {
                    success: 'bg-green-100 text-green-800 border-green-200',
                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    failed: 'bg-red-100 text-red-800 border-red-200',
                    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
                    used: 'bg-purple-100 text-purple-800 border-purple-200',
                  };
                  return (
                    <div key={ticket.id} className="p-4 active:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {ticket.event_title || ticket.event_id || 'Event'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          statusColors[ticket.status] || statusColors.pending
                        }`}>
                          {ticket.status === 'success' && <FaCheckCircle className="mr-1" size={10} />}
                          {ticket.status === 'failed' && <FaTimesCircle className="mr-1" size={10} />}
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tickets</p>
                          <p className="text-sm font-semibold text-gray-900">{ticket.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Net Earnings</p>
                          <p className="text-sm font-bold text-green-600">
                            {ticket.status === 'success' 
                              ? `${(commission - (commission * 15) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB`
                              : '-'
                            }
                          </p>
                        </div>
                      </div>
                      {ticket.status === 'success' && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Gross:</span>
                            <span className="text-gray-700 font-medium">{commission.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-500">VAT (15%):</span>
                            <span className="text-gray-700 font-medium">-{((commission * 15) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB</span>
                          </div>
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Customer</p>
                        <p className="text-xs font-medium text-gray-900">{ticket.customer_name || ticket.customer_email || '-'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VAT (15%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => {
                      const amount = typeof ticket.amount === 'number' ? ticket.amount : parseFloat(String(ticket.amount)) || 0;
                      const ticketTotal = amount * ticket.quantity;
                      let commission = 0;
                      if (seller) {
                        if (seller.commission_type === 'percentage') {
                          commission = (ticketTotal * seller.commission_rate) / 100;
                        } else {
                          commission = seller.commission_rate * ticket.quantity;
                        }
                      }
                      const statusColors = {
                        success: 'bg-green-100 text-green-800 border-green-200',
                        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                        failed: 'bg-red-100 text-red-800 border-red-200',
                        cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
                        used: 'bg-purple-100 text-purple-800 border-purple-200',
                      };
                      return (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {ticket.event_title || ticket.event_id || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{ticket.customer_name || '-'}</div>
                              <div className="text-gray-500 text-xs">{ticket.customer_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {ticket.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {ticketTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {ticket.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {ticket.status === 'success' 
                              ? `${commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${ticket.currency}`
                              : '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                            {ticket.status === 'success' 
                              ? `${((commission * 15) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${ticket.currency}`
                              : '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                            {ticket.status === 'success' 
                              ? `${(commission - (commission * 15) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${ticket.currency}`
                              : '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              statusColors[ticket.status] || statusColors.pending
                            }`}>
                              {ticket.status === 'success' && <FaCheckCircle className="mr-1" size={12} />}
                              {ticket.status === 'failed' && <FaTimesCircle className="mr-1" size={12} />}
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </SellerLayout>
  );
};

export default SellerSales;

