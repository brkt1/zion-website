import React, { useState } from 'react';
import { FaMoneyBillWave, FaFileInvoiceDollar, FaChartLine, FaWallet, FaBuilding, FaUserGraduate, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';

const AccountingDashboard = () => {
  // Static data based on the provided report
  const studentPayments = [
    { name: 'Hana', course: 'Event Planning', amountDue: 8000, amountPaid: 8000, balance: 0, status: 'PAID' },
    { name: 'Samuel', course: 'Event Management', amountDue: 10000, amountPaid: 5000, balance: 5000, status: 'PARTIAL' },
    { name: 'Ruth', course: 'Event Decoration', amountDue: 7000, amountPaid: 0, balance: 7000, status: 'UNPAID' },
  ];

  const eventProfitability = [
    { event: 'Leadership Seminar', income: 80000, cost: 30000, profit: 50000 },
    { event: 'Business Workshop', income: 50000, cost: 20000, profit: 30000 },
    { event: 'Total', income: 130000, cost: 50000, profit: 80000, isTotal: true },
  ];

  const operatingExpenses = [
    { date: '10 Jul', category: 'Salary', description: 'Staff Salary', amount: 60000 },
    { date: '11 Jul', category: 'Rent', description: 'Office Rent', amount: 25000 },
    { date: '12 Jul', category: 'Marketing', description: 'Facebook Ads', amount: 10000 },
    { date: '13 Jul', category: 'Utilities', description: 'Internet', amount: 3000 },
    { date: 'Total Expenses', category: '', description: '', amount: 98000, isTotal: true },
  ];

  const grossIncome = [
    { date: '10 Jul', source: 'Student Fees', amount: 120000 },
    { date: '11 Jul', source: 'Event Income', amount: 80000 },
    { date: '12 Jul', source: 'Training Program', amount: 50000 },
    { date: 'Total Gross Income', source: '', amount: 250000, isTotal: true },
  ];

  const ownerWithdrawals = [
    { date: '12 Jul', amount: 15000, reason: 'Personal Use' },
    { date: '15 Jul', amount: 10000, reason: 'Loan Payment' },
    { date: 'Total Withdrawals', amount: 25000, reason: '—', isTotal: true },
  ];

  const dailyLedger = [
    { date: '10 Jul', income: 120000, expenses: 60000, profit: 60000, cashRec: 70000, bankDep: 50000, notes: 'Student fee collections' },
    { date: '11 Jul', income: 80000, expenses: 25000, profit: 55000, cashRec: 20000, bankDep: 60000, notes: 'Leadership Seminar' },
    { date: '12 Jul', income: 50000, expenses: 10000, profit: 40000, cashRec: 15000, bankDep: 35000, notes: 'Training Program' },
    { date: '13 Jul', income: 0, expenses: 3000, profit: -3000, cashRec: 0, bankDep: 0, notes: 'Internet expense only' },
    { date: 'Total', income: 250000, expenses: 98000, profit: 152000, cashRec: 105000, bankDep: 145000, notes: 'Reconciled Ledger', isTotal: true },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <AdminLayout title="Accounting & Finance">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-[#FFD447]/20 to-[#FF6F5E]/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Yenege Event Organization PLC</h2>
            <h1 className="text-3xl font-black text-[#1C2951] tracking-tight">Event Accounting & Financial Report</h1>
            <p className="text-sm font-semibold text-gray-500 mt-2 flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" /> Location: Addis Ababa, Ethiopia | Date: July 2026
            </p>
          </div>
          <button onClick={() => window.print()} className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1C2951] to-[#2d3d6b] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <FaDownload size={14} />
            Export PDF
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Gross Income</p>
              <p className="text-2xl font-black text-[#1C2951]">{formatCurrency(250000)}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200">
              <FaFileInvoiceDollar className="text-white text-xl" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Expenses</p>
              <p className="text-2xl font-black text-[#1C2951]">{formatCurrency(98000)}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Net Profit</p>
              <p className="text-2xl font-black text-[#1C2951]">{formatCurrency(152000)}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <FaWallet className="text-white text-xl" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Assets</p>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-600">Cash: {formatCurrency(105000)}</span>
                <span className="text-sm font-bold text-gray-600">Bank: {formatCurrency(145000)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Student Payments */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <FaUserGraduate className="text-blue-500" />
              </div>
              <h3 className="text-lg font-black text-[#1C2951]">Student Payments</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Due</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Paid</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Balance</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {studentPayments.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{row.name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">{row.course}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">{formatCurrency(row.amountDue)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 text-right">{formatCurrency(row.amountPaid)}</td>
                      <td className="px-6 py-4 text-sm font-black text-red-500 text-right">{formatCurrency(row.balance)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          row.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          row.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Event Income & Profitability */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <FaBuilding className="text-purple-500" />
              </div>
              <h3 className="text-lg font-black text-[#1C2951]">Event Profitability</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Income</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Cost</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {eventProfitability.map((row, idx) => (
                    <tr key={idx} className={`${row.isTotal ? 'bg-gray-50' : 'hover:bg-gray-50/50'} transition-colors`}>
                      <td className={`px-6 py-4 text-sm ${row.isTotal ? 'font-black text-[#1C2951]' : 'font-bold text-gray-800'}`}>{row.event}</td>
                      <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-black text-green-700' : 'font-semibold text-green-600'}`}>{formatCurrency(row.income)}</td>
                      <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-black text-red-700' : 'font-semibold text-red-500'}`}>{formatCurrency(row.cost)}</td>
                      <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-black text-blue-700 text-base' : 'font-bold text-blue-600'}`}>{formatCurrency(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Operating Expenses & Gross Income & Withdrawals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Operating Expenses */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-1">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <h3 className="text-base font-black text-[#1C2951]">Operating Expenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {operatingExpenses.map((row, idx) => (
                    <tr key={idx} className={`${row.isTotal ? 'bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{row.date}</td>
                      <td className={`px-4 py-3 text-xs ${row.isTotal ? 'font-bold text-gray-400' : 'font-bold text-gray-800'}`}>
                        {row.category}
                        {row.description && <span className="block text-[10px] text-gray-400 font-normal">{row.description}</span>}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right ${row.isTotal ? 'font-black text-red-600' : 'font-semibold text-gray-600'}`}>
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gross Income */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-1">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <h3 className="text-base font-black text-[#1C2951]">Gross Income Streams</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grossIncome.map((row, idx) => (
                    <tr key={idx} className={`${row.isTotal ? 'bg-green-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{row.date}</td>
                      <td className={`px-4 py-3 text-xs font-bold ${row.isTotal ? 'text-gray-400' : 'text-gray-800'}`}>{row.source}</td>
                      <td className={`px-4 py-3 text-sm text-right ${row.isTotal ? 'font-black text-green-700' : 'font-semibold text-green-600'}`}>
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Owner Withdrawals */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-1">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <h3 className="text-base font-black text-[#1C2951]">Owner Withdrawals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ownerWithdrawals.map((row, idx) => (
                    <tr key={idx} className={`${row.isTotal ? 'bg-amber-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{row.date}</td>
                      <td className={`px-4 py-3 text-xs font-bold ${row.isTotal ? 'text-gray-400' : 'text-gray-800'}`}>{row.reason}</td>
                      <td className={`px-4 py-3 text-sm text-right ${row.isTotal ? 'font-black text-amber-700' : 'font-semibold text-amber-600'}`}>
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Daily Ledger */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-black text-[#1C2951]">Daily Activity & Reconciliation Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Income</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Expenses</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Profit</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Cash Rec.</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Bank Dep.</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dailyLedger.map((row, idx) => (
                  <tr key={idx} className={`${row.isTotal ? 'bg-[#1C2951] text-white' : 'hover:bg-gray-50/50'}`}>
                    <td className={`px-6 py-4 text-sm whitespace-nowrap ${row.isTotal ? 'font-black' : 'font-bold text-gray-600'}`}>{row.date}</td>
                    <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-bold text-green-300' : 'font-semibold text-green-600'}`}>{formatCurrency(row.income)}</td>
                    <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-bold text-red-300' : 'font-semibold text-red-500'}`}>{row.expenses < 0 ? `(${formatCurrency(Math.abs(row.expenses))})` : formatCurrency(row.expenses)}</td>
                    <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-black text-white text-base' : 'font-bold text-[#1C2951]'}`}>{row.profit < 0 ? `(${formatCurrency(Math.abs(row.profit))})` : formatCurrency(row.profit)}</td>
                    <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-bold text-amber-300' : 'font-semibold text-gray-600'}`}>{formatCurrency(row.cashRec)}</td>
                    <td className={`px-6 py-4 text-sm text-right ${row.isTotal ? 'font-bold text-blue-300' : 'font-semibold text-gray-600'}`}>{formatCurrency(row.bankDep)}</td>
                    <td className={`px-6 py-4 text-xs ${row.isTotal ? 'font-semibold text-gray-300' : 'font-medium text-gray-500'} italic`}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-[#1C2951] rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD447]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
            <span className="text-[#FFD447]">#</span> Monthly Summary & Closing Balances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12 relative z-10">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Total Gross Income</p>
              <p className="text-2xl font-black text-white">{formatCurrency(250000)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Total Expenses</p>
              <p className="text-2xl font-black text-white">{formatCurrency(98000)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Net Profit (Operations)</p>
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(152000)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Outstanding Balances</p>
              <p className="text-xl font-black text-white">{formatCurrency(12000)} <span className="text-sm font-semibold text-indigo-300 ml-2">(Samuel: 5k, Ruth: 7k)</span></p>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Direct Event Profit</p>
              <p className="text-xl font-black text-white">{formatCurrency(80000)} <span className="text-sm font-semibold text-indigo-300 ml-2">(Seminar & Workshop)</span></p>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Owner Withdrawals</p>
              <p className="text-xl font-black text-white">{formatCurrency(25000)}</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Current Closing Cash Allocation</p>
              <p className="text-lg font-black text-white flex items-center gap-4">
                <span>Cash: {formatCurrency(105000)}</span>
                <span className="text-white/30">|</span>
                <span>Bank Deposits: {formatCurrency(145000)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-indigo-300">Automated Period Reconciliation</p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AccountingDashboard;
