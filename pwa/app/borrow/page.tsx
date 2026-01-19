'use client';

import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ShieldCheck, X, ChevronDown } from 'lucide-react';

const LOAN_PERIODS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 },
  { label: '120 Days', days: 120 },
  { label: '180 Days', days: 180 },
  { label: '210 Days', days: 210 },
  { label: '240 Days', days: 240 },
  { label: '270 Days', days: 270 },
  { label: '300 Days', days: 300 },
  { label: '1 Year', days: 365 },
];

export default function Borrow() {
  const profileStats = useAppStore((state) => state.profileStats);
  const balance = useAppStore((state) => state.balance);

  const [activeTab, setActiveTab] = useState<'borrow' | 'repay'>('borrow');
  const [borrowAmount, setBorrowAmount] = useState(1200);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(3); // 90 days default
  const [privateMode, setPrivateMode] = useState(false);
  const [showInterestInfo, setShowInterestInfo] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBorrowingInfo, setShowBorrowingInfo] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<string | null>(null);

  // Calculate available credit
  const availableCredit = profileStats.creditLimit - profileStats.creditUsed;
  const maxBorrowable = Math.floor(availableCredit * 0.8); // 80% LTV max

  // Calculate interest rate based on credit score
  const baseRate = 4.5;
  const creditScoreBonus = profileStats.creditScore >= 750 ? 0.5 : 0;
  const annualInterest = baseRate - creditScoreBonus;
  const rewardsRate = 0.2;

  // Calculate LTV
  const ltv = ((borrowAmount / availableCredit) * 100).toFixed(0);

  // Calculate health factor (simplified)
  const healthFactor = borrowAmount > 0 ? ((availableCredit / borrowAmount) * 1.8).toFixed(1) : '∞';
  const healthStatus = parseFloat(healthFactor) > 2 ? 'Safe' : parseFloat(healthFactor) > 1.5 ? 'Moderate' : 'Risk';

  const handleSliderChange = (index: number) => {
    setSelectedPeriodIndex(index);
  };

  const handleAmountChange = (value: number) => {
    if (value <= maxBorrowable) {
      setBorrowAmount(value);
    }
  };

  const handleMaxClick = () => {
    setBorrowAmount(maxBorrowable);
  };

  const handleConfirmBorrow = () => {
    if (borrowAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (borrowAmount > maxBorrowable) {
      alert('Amount exceeds maximum borrowable');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    setShowConfirmDialog(false);
    alert(`Successfully borrowed ${borrowAmount} USDC for ${LOAN_PERIODS[selectedPeriodIndex].label}!`);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="flex items-center py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black">Borrow</h1>
        </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6 pb-36">

        {/*Current borrowed*/}
        <div className="flex flex-col gap-1 pt-2">
          <p className="text-green-500 font-mono tracking-widest uppercase mb-1 text-xs">
            Total Borrowed
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold text-black tracking-tight font-mono">
              {profileStats.balances.borrowed !== undefined ? (<p>{profileStats.balances.borrowed} USDC</p>) : <p>0.00 USDC</p>}
            </h1>
          </div>
        </div>

        {/* Borrow Amount Input */}
        <div className="flex flex-col items-center gap-6 py-4 mb-6 pt-10">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-2">I want to borrow</p>
            <div className="flex items-center justify-center">
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
                className="text-4xl font-bold tracking-tight text-black bg-transparent border-none outline-none w-24 text-center"
              />
              <span className="text-2xl font-bold text-gray-400">USDC</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">≈ ${borrowAmount.toLocaleString()} USD</p>
            <div className="flex flex-col items-center text-gray-400 justify-center mt-2">
              <p className="text-xs">Available Credit Limit:</p>
              <div>
                <p className="text-xs">{maxBorrowable.toLocaleString()} USDC</p>
                <button
                  onClick={handleMaxClick}
                  className="text-xs font-bold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded uppercase hover:bg-neon-green/20 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Time Period Slider */}
          <div className="w-full px-2">
            <p className="text-sm font-medium text-gray-500 mb-4 text-center">Loan Duration</p>
            <div className="relative w-full h-10 flex items-center">
              <input
                type="range"
                min="0"
                max={LOAN_PERIODS.length - 1}
                value={selectedPeriodIndex}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #14F195 0%, #14F195 ${(selectedPeriodIndex / (LOAN_PERIODS.length - 1)) * 100}%, #e5e7eb ${(selectedPeriodIndex / (LOAN_PERIODS.length - 1)) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-400 mt-2">
              <span>7d</span>
              <span>90d</span>
              <span>180d</span>
              <span>1y</span>
            </div>
            <p className="text-center text-sm font-bold text-black mt-3">
              {LOAN_PERIODS[selectedPeriodIndex].label}
            </p>
          </div>
        </div>

        {/* Health & Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Health Factor */}
          <div className="col-span-2 bg-neon-green/5 border-2 border-neon-green/20 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-medium text-gray-700">Health Factor</span>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-black">{healthFactor}</span>
                <span className="text-sm font-semibold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">
                  {healthStatus}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">
                Liquidation at <span className="font-medium text-red-500">1.0</span>
              </p>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-red-500 w-[20%]"></div>
                <div className="h-full bg-yellow-400 w-[20%]"></div>
                <div className="h-full bg-neon-green w-[60%]"></div>
              </div>
            </div>
          </div>

          {/* Annual Interest */}
          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-500">Annual Interest</p>
              <button
                onClick={() => setShowInterestInfo(true)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xl font-bold text-black">{annualInterest}%</p>
            <p className="text-xs text-neon-green font-medium">+{rewardsRate}% Rewards</p>
          </div>

          {/* LTV */}
          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-1">Loan-to-Value</p>
            <p className="text-xl font-bold text-black">{ltv}%</p>
            <p className="text-xs text-gray-400 font-medium">Max 80%</p>
          </div>
        </div>

        <div className='h-10'></div>

        {/* Confirm Button */}
        <div className='flex gap-3 fixed z-10 bottom-24 left-0 right-0 max-w-lg mx-auto px-6'>
          <button
            onClick={handleConfirmBorrow}
            className="w-full bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold text-lg py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Confirm Borrow</span>
            <span className="text-xl">→</span>
          </button>
        </div>

        {/* Borrowing Activity Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-solana-purple rounded-full"></div>
            Active Borrowings
          </h2>
          <BorrowingActivity 
            onShowInfo={(id: string) => {
              setSelectedBorrowing(id);
              setShowBorrowingInfo(true);
            }}
          />
        </div>
      </main>

      {/* Interest Info Dialog */}
      <AnimatePresence>
        {showInterestInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInterestInfo(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-19 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Interest Rate Breakdown</h3>
                <button
                  onClick={() => setShowInterestInfo(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Base Rate</span>
                    <span className="font-bold text-black">{baseRate}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Credit Score Bonus</span>
                    <span className="font-bold text-neon-green">-{creditScoreBonus}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                    <span className="text-sm font-semibold text-gray-800">Your Rate</span>
                    <span className="font-bold text-black text-lg">{annualInterest}%</span>
                  </div>
                  <div className="bg-neon-green/10 rounded-xl p-4 mt-4">
                    <p className="text-xs text-gray-600 mb-2">Based on your on-chain records:</p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Credit Score: {profileStats.creditScore} (Excellent)</li>
                      <li>• Active Loans: {profileStats.activeLoans}</li>
                      <li>• Payment History: 100% on-time</li>
                      <li>• Trust Score: High</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDialog(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-19 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Confirm Borrow</h3>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Amount Summary */}
                  <div className="bg-linear-to-br from-solana-purple/10 to-transparent border-2 border-solana-purple/30 p-6 rounded-xl text-center">
                    <p className="text-sm text-gray-600 mb-2">You are borrowing</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-black">{borrowAmount}</span>
                      <span className="text-xl text-gray-500">USDC</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">≈ ${borrowAmount.toLocaleString()} USD</p>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Loan Duration</span>
                      <span className="font-bold text-black">{LOAN_PERIODS[selectedPeriodIndex].label}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Interest Rate</span>
                      <span className="font-bold text-solana-purple">{annualInterest}% APY</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Health Factor</span>
                      <span className="font-bold text-neon-green">{healthFactor}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Loan-to-Value</span>
                      <span className="font-bold text-black">{ltv}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                      <span className="text-sm font-semibold text-gray-800">Total to Repay</span>
                      <span className="font-bold text-black text-lg">${(borrowAmount * (1 + (annualInterest / 100) * (LOAN_PERIODS[selectedPeriodIndex].days / 365))).toFixed(2)} USDC</span>
                    </div>
                  </div>

                  {/* Privacy Mode Status */}
                  {privateMode && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-neon-green" />
                      <div>
                        <p className="text-sm font-semibold text-black">Private Mode Enabled</p>
                        <p className="text-xs text-gray-500">Transaction will use ZK proofs</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFinalConfirm}
                      className="flex-1 bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98]"
                    >
                      Confirm & Borrow
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Borrowing Info Dialog */}
      <AnimatePresence>
        {showBorrowingInfo && selectedBorrowing && (() => {
          const borrowingActivities = useAppStore.getState().borrowingActivities;
          const selectedBorrowingData = borrowingActivities.find(b => b.id === selectedBorrowing);
          if (!selectedBorrowingData) return null;
          
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBorrowingInfo(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-19 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold">Loan Details</h3>
                  <button
                    onClick={() => setShowBorrowingInfo(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Amount Summary */}
                    <div className="bg-linear-to-br from-solana-purple/10 to-transparent border-2 border-solana-purple/30 p-6 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">Borrowed Amount</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-solana-purple">${selectedBorrowingData.amount}</span>
                        <span className="text-xl text-gray-500">USDC</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-solana-purple/20">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-gray-600">
                            Total Due: <span className="font-bold text-black">${selectedBorrowingData.totalDue.toFixed(2)} USDC</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Loan Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Loan ID</span>
                        <span className="font-bold text-black">#{selectedBorrowingData.id}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Borrowed Date</span>
                        <span className="font-bold text-black">{selectedBorrowingData.borrowed}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Due Date</span>
                        <span className="font-bold text-black">{selectedBorrowingData.dueDate}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Loan Duration</span>
                        <span className="font-bold text-black">{selectedBorrowingData.duration} days</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Interest Rate</span>
                        <span className="font-bold text-solana-purple">{selectedBorrowingData.interestRate}% APY</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Interest Accrued</span>
                        <span className="font-bold text-red-500">${selectedBorrowingData.interestDue.toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                        <span className="text-sm font-semibold text-gray-800">Status</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full flex items-center gap-1">
                          <ChevronDown className="w-3 h-3" />
                          {selectedBorrowingData.status}
                        </span>
                      </div>
                    </div>

                    {/* Payment Warning */}
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-900 mb-2 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Payment Reminder
                      </p>
                      <p className="text-xs text-yellow-800">
                        Please ensure to repay ${selectedBorrowingData.totalDue.toFixed(2)} USDC by {selectedBorrowingData.dueDate} to avoid late fees and maintain your credit score.
                      </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Loan Details</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Collateral Type</span>
                          <span className="text-gray-700 font-medium">Credit-based</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Network</span>
                          <span className="text-gray-700 font-medium">Solana</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Privacy Mode</span>
                          <span className="text-gray-700 font-medium">ZK Proofs</span>
                        </div>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowBorrowingInfo(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors mt-2"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// Borrowing Activity Component
function BorrowingActivity({ onShowInfo }: { onShowInfo: (id: string) => void }) {
  const borrowingActivities = useAppStore((state) => state.borrowingActivities);
  const activeLoans = borrowingActivities.filter(loan => loan.status === 'active');

  if (activeLoans.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 text-sm">No active borrowings</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeLoans.map((loan) => (
        <div key={loan.id} className="">
          <div
            key={loan.id}
            className="bg-white rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xl font-bold text-black">${loan.amount} USDC</p>
                <p className="text-xs text-gray-500">Borrowed on {loan.borrowed}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Due Date</p>
                <p className="text-sm font-bold text-solana-purple">{loan.dueDate}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                {loan.status}
              </span>
              <button
                onClick={() => onShowInfo(loan.id)}
                className="text-xs font-bold text-solana-purple px-3 py-1.5 rounded-lg uppercase transition-colors flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                More Info
              </button>
            </div>
          </div>
          <div className='border-b border-black/30'></div>
        </div>
      ))}
    </div>
  );
}
