import { useMemo } from 'react';
import { FaChartLine, FaCheckCircle, FaDollarSign, FaMoneyBillWave, FaTicketAlt, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SellerHeader from '../../Components/admin/SellerHeader';
import SellerLayout from '../../Components/admin/SellerLayout';
import { useSellerData } from '../../hooks/useSellerData';

const SellerDashboard = () => {
  const { seller, user, salesStats, loading, isAuthorized, tickets } = useSellerData();
  const navigate = useNavigate();

  // Prepare chart data - last 7 days (must be before early returns)
  const chartData = useMemo(() => {
    if (!seller) return [];
    
    const successfulTickets = tickets?.filter(t => t.status === 'success' || t.status === 'used') || [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return last7Days.map(date => {
      const dayTickets = successfulTickets.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        ticketDate.setHours(0, 0, 0, 0);
        return ticketDate.getTime() === date.getTime();
      });

      let dayCommission = 0;
      dayTickets.forEach(ticket => {
        const amount = typeof ticket.amount === 'number' ? ticket.amount : parseFloat(String(ticket.amount)) || 0;
        const ticketTotal = amount * ticket.quantity;
        if (seller.commission_type === 'percentage') {
          dayCommission += (ticketTotal * seller.commission_rate) / 100;
        } else {
          dayCommission += seller.commission_rate * ticket.quantity;
        }
      });

      const dayVAT = (dayCommission * 15) / 100;
      const dayNet = dayCommission - dayVAT;

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tickets: dayTickets.reduce((sum, t) => sum + t.quantity, 0),
        gross: dayCommission,
        vat: dayVAT,
        net: dayNet,
      };
    });
  }, [tickets, seller]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const maxNet = Math.max(...chartData.map(d => d.net));
    return Math.max(maxNet, 100);
  }, [chartData]);

  if (loading) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (!isAuthorized || !seller) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaTicketAlt className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-500 mb-6">You are not registered as a commission seller.</p>
            <button
              onClick={() => navigate('/admin/login')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </SellerLayout>
    );
  }

  // Calculate progress to next milestone
  const milestones = [
    { count: 50, label: '50 Tickets' },
    { count: 100, label: '100 Tickets' },
    { count: 150, label: '150 Tickets' },
    { count: 200, label: '200 Tickets' },
  ];

  const getNextMilestone = () => {
    const current = salesStats.successfulTickets;
    for (const milestone of milestones) {
      if (current < milestone.count) {
        return milestone;
      }
    }
    return null;
  };

  const nextMilestone = getNextMilestone();
  const progressPercentage = nextMilestone 
    ? (salesStats.successfulTickets / nextMilestone.count) * 100 
    : 100;

  const calculateMilestoneEarnings = (ticketCount: number) => {
    if (!seller) return { gross: 0, vat: 0, net: 0 };
    const avgPrice = salesStats.averageTicketPrice > 0 ? salesStats.averageTicketPrice : 500;
    const totalRevenue = ticketCount * avgPrice;
    let grossCommission = 0;
    if (seller.commission_type === 'percentage') {
      grossCommission = (totalRevenue * seller.commission_rate) / 100;
    } else {
      grossCommission = seller.commission_rate * ticketCount;
    }
    const vat = (grossCommission * 15) / 100;
    const net = grossCommission - vat;
    return { gross: grossCommission, vat, net };
  };

  return (
    <SellerLayout>
      <SellerHeader seller={seller} user={user} title="Dashboard" />
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Mobile Welcome Card */}
        <div className="mb-4 md:hidden bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-90">Welcome back,</p>
              <p className="text-xl font-bold">{seller.name}</p>
              <p className="text-xs opacity-75 mt-1">Keep selling to reach your goals!</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              seller.is_active 
                ? 'bg-white/20 text-white border border-white/30' 
                : 'bg-white/10 text-white/80 border border-white/20'
            }`}>
              {seller.is_active ? (
                <FaCheckCircle size={10} />
              ) : (
                <FaTimesCircle size={10} />
              )}
              {seller.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Current Stats Overview */}
        <div className={`mb-6 md:mb-8 grid grid-cols-2 ${salesStats.totalRevenue > 0 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-3 md:gap-4`}>
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 active:scale-95 transition-transform">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs md:text-sm font-medium">Tickets</p>
                <div className="h-8 w-8 md:h-12 md:w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FaTicketAlt className="text-yellow-600" size={16} />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{salesStats.successfulTickets}</p>
              <p className="text-xs text-gray-400 mt-1 hidden md:block">Total successful sales</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 active:scale-95 transition-transform">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs md:text-sm font-medium">Net Earnings</p>
                <div className="h-8 w-8 md:h-12 md:w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="text-green-600" size={16} />
                </div>
              </div>
              <p className="text-xl md:text-3xl font-bold text-gray-900">
                {salesStats.netCommission.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-400 mt-1 hidden md:block">ETB (after 15% VAT)</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 active:scale-95 transition-transform">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs md:text-sm font-medium">Gross Commission</p>
                <div className="h-8 w-8 md:h-12 md:w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaDollarSign className="text-blue-600" size={16} />
                </div>
              </div>
              <p className="text-xl md:text-3xl font-bold text-gray-900">
                {salesStats.totalCommission.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-400 mt-1 hidden md:block">ETB (before VAT)</p>
            </div>
          </div>
          {salesStats.totalRevenue > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 active:scale-95 transition-transform">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-xs md:text-sm font-medium">VAT (15%)</p>
                  <div className="h-8 w-8 md:h-12 md:w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FaDollarSign className="text-amber-600" size={16} />
                  </div>
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-900">
                  {salesStats.totalVAT.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-400 mt-1 hidden md:block">ETB deducted</p>
              </div>
            </div>
          )}
        </div>

        {/* Sales Chart */}
        {seller && (
          <div className="mb-6 md:mb-8 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FaChartLine className="text-yellow-600" size={20} />
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Sales Overview (Last 7 Days)</h2>
            </div>
            <div className="relative">
              {/* Chart Container */}
              <div className="h-64 md:h-80 flex items-end justify-between gap-2 md:gap-4 pb-8 border-b border-gray-200">
                {chartData.map((data, index) => {
                  const heightPercentage = maxValue > 0 ? (data.net / maxValue) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      {/* Bar */}
                      <div className="w-full max-w-12 md:max-w-16 relative flex flex-col items-center justify-end h-full">
                        <div
                          className="w-full bg-gradient-to-t from-yellow-500 to-amber-600 rounded-t-lg transition-all duration-300 hover:from-yellow-600 hover:to-amber-700 cursor-pointer relative"
                          style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                          title={`${data.date}: ${data.net.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB`}
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            <div className="font-semibold">{data.date}</div>
                            <div>Net: {data.net.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB</div>
                            <div>Tickets: {data.tickets}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      {/* Date Label */}
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        {data.date.split(' ')[1]}
                      </div>
                      <div className="text-xs text-gray-400 text-center">
                        {data.date.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                <span>{maxValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <span>{(maxValue * 0.75).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <span>{(maxValue * 0.5).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <span>{(maxValue * 0.25).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <span>0</span>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded"></div>
                <span className="text-gray-600">Net Earnings (ETB)</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="mb-6 md:mb-8 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-3 md:mb-0">
                <h2 className="text-base md:text-lg font-bold text-gray-900">Next Goal</h2>
                <p className="text-xs md:text-sm text-gray-500">Keep selling to reach your next milestone!</p>
              </div>
              <div className="flex items-center gap-2">
                <FaTicketAlt className="text-yellow-500" size={20} />
                <span className="text-xl md:text-2xl font-bold text-gray-900">{nextMilestone.label}</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-gray-600 font-medium">
                  {salesStats.successfulTickets} / {nextMilestone.count} tickets
                </span>
                <span className="text-gray-600 font-medium">
                  {nextMilestone.count - salesStats.successfulTickets} more to go!
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2.5 md:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl space-y-2">
              <p className="text-xs md:text-sm text-gray-700">
                <span className="font-semibold">Potential Net Earnings:</span>{' '}
                <span className="text-yellow-600 font-bold">
                  {calculateMilestoneEarnings(nextMilestone.count).net.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB
                </span>
                {' '}if you reach {nextMilestone.count} tickets!
              </p>
              <p className="text-xs text-gray-600">
                (Gross: {calculateMilestoneEarnings(nextMilestone.count).gross.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB - VAT: {calculateMilestoneEarnings(nextMilestone.count).vat.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB)
              </p>
            </div>
          </div>
        )}
      </main>
    </SellerLayout>
  );
};

export default SellerDashboard;
