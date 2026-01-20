'use client';

import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ShieldCheck, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function Repay() {
  const borrowingActivities = useAppStore((state) => state.borrowingActivities);
  const repayingActivities = useAppStore((state) => state.repayingActivities);
  const balance = useAppStore((state) => state.balance);
  
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [showRepaymentInfo, setShowRepaymentInfo] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<string | null>(null);

  const activeLoans = borrowingActivities.filter(loan => loan.status === 'active');
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.totalDue, 0);

  const handleRepayClick = (loanId: string, maxAmount: number) => {
    setSelectedLoan(loanId);
    setRepayAmount(0);
    setShowConfirmDialog(true);
  };

  const handleSetMaxRepayment = () => {
    if (selectedLoanData) {
      setRepayAmount(selectedLoanData.totalDue);
    }
  };

  const handleConfirmRepay = () => {
    setShowConfirmDialog(false);
    alert(`Successfully repaid $${repayAmount} USDC!`);
  };

  const selectedLoanData = activeLoans.find(loan => loan.id === selectedLoan);
  const selectedRepaymentData = repayingActivities.find(r => r.id === selectedRepayment);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white text-black"
    >
      {/* Header */}
      <div className="flex items-center py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black">Repay</h1>
        </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6 pb-28">
        {/* Total Outstanding */}
        <div className="flex flex-col gap-1 pt-2 mb-6">
          <p className="text-red-500 font-mono tracking-widest uppercase mb-1 text-xs">
            Total Outstanding
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold text-black tracking-tight font-mono">
              ${totalOutstanding.toFixed(2)} USDC
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {activeLoans.length} active loan{activeLoans.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Active Loans */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-solana-purple rounded-full"></div>
            Active Loans
          </h2>
          <div className="space-y-3">
            {activeLoans.map((loan) => (
              <div 
                key={loan.id}
                className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-black">${loan.amount} USDC</p>
                    <p className="text-xs text-gray-500 mt-1">+ ${loan.interestDue.toFixed(2)} interest</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Due Date</p>
                    <p className="text-sm font-bold text-red-500">{loan.dueDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Interest Rate</p>
                    <p className="text-sm font-bold">{loan.interestRate}% APY</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Due</p>
                    <p className="text-sm font-bold text-black">${loan.totalDue.toFixed(2)} USDC</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleRepayClick(loan.id, loan.totalDue)}
                  className="w-full bg-neon-green hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] shadow-sm"
                >
                  Repay Loan
                </button>
              </div>
            ))}
            {activeLoans.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No active loans</p>
                <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Repayment History */}
        {/* <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-neon-green rounded-full"></div>
            Repayment History
          </h2>
          <div className="space-y-3">
            {repayingActivities.slice(0, 5).map((repay) => (
              <div key={repay.id}>
                <div 
                  key={repay.id}
                  className="bg-white rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xl font-bold text-neon-green">${repay.amount > 0 ? repay.amount.toFixed(2) : '0.00'} USDC</p>
                      <p className="text-xs text-gray-500">Loan #{repay.loanId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Repaid On</p>
                      <p className="text-sm font-bold text-black">{repay.repaidDate}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRepayment(repay.id);
                        setShowRepaymentInfo(true);
                      }}
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
            {repayingActivities.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-gray-600 text-sm">No repayment history yet</p>
              </div>
            )}
          </div>
        </div> */}
      </main>

      {/* Repayment Info Dialog */}
      <AnimatePresence>
        {showRepaymentInfo && selectedRepaymentData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRepaymentInfo(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Repayment Details</h3>
                <button
                  onClick={() => setShowRepaymentInfo(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Amount Summary */}
                  <div className="bg-linear-to-br from-neon-green/10 to-transparent border-2 border-neon-green/30 p-6 rounded-xl text-center">
                    <p className="text-sm text-gray-600 mb-2">Payment Amount</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-neon-green">${selectedRepaymentData.amount > 0 ? selectedRepaymentData.amount.toFixed(2) : '0.00'}</span>
                      <span className="text-xl text-gray-500">USDC</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neon-green/20">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                        <span className="text-sm font-semibold text-green-900">Payment Successful</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Loan ID</span>
                      <span className="font-bold text-black">#{selectedRepaymentData.loanId}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Payment Date</span>
                      <span className="font-bold text-black">{selectedRepaymentData.repaidDate}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Payment Type</span>
                      <span className="font-bold text-black">
                        {selectedRepaymentData.remainingBalance === 0 ? 'Full Payment' : 'Partial Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Remaining Balance</span>
                      <span className="font-bold text-black">${selectedRepaymentData.remainingBalance.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                      <span className="text-sm font-semibold text-gray-800">Status</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Credit Score Impact */}
                  <div className="bg-neon-green/10 rounded-xl p-4 border border-neon-green/20">
                    <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Credit Score Impact
                    </p>
                    <p className="text-xs text-green-800">
                      {selectedRepaymentData.remainingBalance === 0 
                        ? 'This full repayment positively impacted your credit score. Keep up the good work!'
                        : 'This partial payment was recorded and will help maintain your credit standing.'
                      }
                    </p>
                  </div>

                  {/* Transaction Details */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Transaction Details</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-mono text-gray-800">{selectedRepaymentData.id}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Network</span>
                        <span className="text-gray-800">Solana Mainnet</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Privacy</span>
                        <span className="text-gray-800">Standard</span>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setShowRepaymentInfo(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors mt-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && selectedLoanData && (
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
              className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Confirm Repayment</h3>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Repayment Amount Input */}
                  <div className="bg-linear-to-br from-neon-green/10 to-transparent border-2 border-neon-green/30 p-6 rounded-xl">
                    <p className="text-sm text-gray-600 mb-3 text-center">Enter Repayment Amount</p>
                    <div className="flex items-center bg-gray-100 w-min mx-auto p-2 justify-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        value={repayAmount === 0 ? '' : repayAmount}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= selectedLoanData.totalDue) {
                            setRepayAmount(value);
                          } else if (value > selectedLoanData.totalDue) {
                            setRepayAmount(selectedLoanData.totalDue);
                          }
                        }}
                        placeholder="0.00"
                        min="0"
                        max={selectedLoanData.totalDue}
                        step="0.01"
                        className="text-4xl font-bold text-black outline-none w-32 text-center"
                      />
                      <span className="text-xl text-gray-500">USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Max: ${selectedLoanData.totalDue.toFixed(2)} USDC</span>
                      <button
                        onClick={handleSetMaxRepayment}
                        className="font-bold text-neon-green bg-neon-green/10 px-3 py-1 rounded uppercase hover:bg-neon-green/20 transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    {repayAmount > 0 && (
                      <div className="mt-3 pt-3 border-t border-neon-green/20">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {repayAmount >= selectedLoanData.totalDue ? 'Full Payment' : 'Partial Payment'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Loan Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Original Amount</span>
                      <span className="font-bold text-black">${selectedLoanData.amount} USDC</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Interest Accrued</span>
                      <span className="font-bold text-red-500">${selectedLoanData.interestDue.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Due Date</span>
                      <span className="font-bold text-black">{selectedLoanData.dueDate}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Payment Amount</span>
                      <span className="font-bold text-neon-green">${repayAmount.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                      <span className="text-sm font-semibold text-gray-800">Remaining After Payment</span>
                      <span className="font-bold text-black text-lg">${(selectedLoanData.totalDue - repayAmount).toFixed(2)} USDC</span>
                    </div>
                  </div>

                  {/* Payment Type Info */}
                  {repayAmount > 0 && (
                    <div className={`rounded-xl p-4 border ${
                      repayAmount >= selectedLoanData.totalDue 
                        ? 'bg-neon-green/10 border-neon-green/20' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                        {repayAmount >= selectedLoanData.totalDue ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-900" />
                            <span className="text-green-900">Full Payment</span>
                          </>
                        ) : (
                          <>
                            <Info className="w-4 h-4 text-blue-900" />
                            <span className="text-blue-900">Partial Payment</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-700">
                        {repayAmount >= selectedLoanData.totalDue 
                          ? 'This will fully settle your loan and positively impact your credit score.'
                          : `You will still owe $${(selectedLoanData.totalDue - repayAmount).toFixed(2)} USDC after this payment.`
                        }
                      </p>
                    </div>
                  )}

                  {/* Privacy Mode */}
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
                      onClick={handleConfirmRepay}
                      disabled={repayAmount <= 0 || repayAmount > selectedLoanData.totalDue}
                      className="flex-1 bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Repayment
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
