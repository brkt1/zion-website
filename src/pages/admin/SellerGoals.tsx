import { FaChartLine, FaCheckCircle, FaFire, FaStar, FaTicketAlt, FaTrophy } from 'react-icons/fa';
import SellerHeader from '../../Components/admin/SellerHeader';
import SellerLayout from '../../Components/admin/SellerLayout';
import { useSellerData } from '../../hooks/useSellerData';

const SellerGoals = () => {
  const { seller, user, salesStats, loading } = useSellerData();

  if (loading || !seller) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading goals...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

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

  const milestones = [
    { count: 50, label: '50 Tickets', icon: FaTicketAlt, color: 'from-yellow-400 to-yellow-500' },
    { count: 100, label: '100 Tickets', icon: FaTrophy, color: 'from-yellow-500 to-amber-500' },
    { count: 150, label: '150 Tickets', icon: FaStar, color: 'from-amber-500 to-amber-600' },
    { count: 200, label: '200 Tickets', icon: FaFire, color: 'from-yellow-600 to-amber-700' },
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

  return (
    <SellerLayout>
      <SellerHeader seller={seller} user={user} title="Goals" />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="mb-6 md:mb-8 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-3 md:mb-0">
                <h2 className="text-base md:text-lg font-bold text-gray-900">Next Goal</h2>
                <p className="text-xs md:text-sm text-gray-500">Keep selling to reach your next milestone!</p>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = nextMilestone.icon;
                  const colorClass = nextMilestone.color.includes('yellow') ? 'text-yellow-500' :
                                   nextMilestone.color.includes('amber') ? 'text-amber-500' :
                                   'text-yellow-600';
                  return <Icon className={colorClass} size={20} />;
                })()}
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

        {/* Sales Goals / Milestones */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
            <FaChartLine className="text-yellow-600" size={20} />
            <span>Sales Goals & Rewards</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              const isAchieved = salesStats.successfulTickets >= milestone.count;
              const potentialEarnings = calculateMilestoneEarnings(milestone.count);
              
              return (
                <div
                  key={milestone.count}
                  className={`bg-gradient-to-br ${milestone.color} rounded-2xl shadow-lg p-4 md:p-6 text-white transform transition-all duration-300 active:scale-95 md:hover:scale-105 ${
                    isAchieved ? 'ring-2 md:ring-4 ring-yellow-300 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={20} className="opacity-90" />
                    {isAchieved && (
                      <FaCheckCircle className="text-yellow-300" size={16} />
                    )}
                  </div>
                  <h3 className="text-base md:text-xl font-bold mb-1">{milestone.label}</h3>
                  <p className="text-xs md:text-sm opacity-90 mb-2 md:mb-3">
                    {isAchieved ? 'Achieved!' : 'Goal'}
                  </p>
                  <div className="pt-2 md:pt-3 border-t border-white/20">
                    <p className="text-xs opacity-75 mb-1">Net Earnings</p>
                    <p className="text-lg md:text-2xl font-bold">
                      {potentialEarnings.net.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs opacity-75">ETB (after VAT)</p>
                    <p className="text-xs opacity-60 mt-1">
                      Gross: {potentialEarnings.gross.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB
                    </p>
                  </div>
                  {isAchieved && (
                    <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
                      <p className="text-xs font-semibold">🎉 Milestone Reached!</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </SellerLayout>
  );
};

export default SellerGoals;

