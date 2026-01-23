'use client';

import { useAppStore } from '@/lib/store';
import { IconWallet } from '@tabler/icons-react';
import { TrendingUp, TrendingDown, Wallet2, Activity, ArrowUpRight, ArrowDownRight, Shield, RefreshCw, X, Copy, Check, Scan } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Wallet() {
  const { publicKey, connected } = useWallet();
  const walletAddress = useAppStore((state) => state.walletAddress);
  const getProfileStats = useAppStore((state) => state.getProfileStats);
  const wallet = useAppStore((state) => state.wallet);
  const getActualUsdcBalance = useAppStore((state) => state.getActualUsdcBalance);
  const getBorrowedUsdcBalance = useAppStore((state) => state.getBorrowedUsdcBalance);
  const allActivities = useAppStore((state) => state.allActivities);

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<'SOL' | 'USDC'>('USDC');
  const [copied, setCopied] = useState(false);

  // Get profile stats
  const profileStats = getProfileStats();

  // Calculate wallet values from tokens
  const totalValue = wallet.tokens.reduce((sum, token) => sum + (token.balance * token.price), 0);
  const borrowedAmount = getBorrowedUsdcBalance();
  const actualBalance = totalValue - borrowedAmount; // Total portfolio value minus what's borrowed

  // Get tokens from wallet
  const solToken = wallet.tokens.find(t => t.symbol === 'SOL');
  const usdcToken = wallet.tokens.find(t => t.symbol === 'USDC');
  const solValue = solToken ? solToken.balance * solToken.price : 0;
  const usdcValue = usdcToken ? usdcToken.balance * usdcToken.price : 0;
  const totalAssetValue = solValue + usdcValue;

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💳';
      case 'lend':
        return '📤';
      case 'borrow':
        return '📥';
      case 'repay':
        return '💰';
      case 'swap':
        return '🔄';
      case 'transfer':
        return '➡️';
      default:
        return '📊';
    }
  };

  const handleCopyAddress = () => {
    const address = walletAddress || '0x742d...f44e';
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    // TODO: Implement actual send logic
    alert(`Sending ${sendAmount} ${selectedToken} to ${sendAddress}`);
    setShowSendDialog(false);
    setSendAddress('');
    setSendAmount('');
  };

  const getMaxBalance = () => {
    if (selectedToken === 'SOL') {
      return solToken?.balance || 0;
    }
    return usdcToken?.balance || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white text-black pb-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black">Wallet</h1>
        </div>
        <WalletMultiButton style={{ fontSize: '12px', padding: '8px 16px', height: 'auto' }} />
      </div>

      {/* Solana Wallet Connection Status */}
      {connected && publicKey && (
        <div className="px-6 mb-4">
          <div className="bg-linear-to-r from-purple-100 to-green-100 dark:from-purple-950/20 dark:to-green-950/20 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Solana Wallet Connected</span>
            </div>
            <div className="text-xs font-mono text-black dark:text-white break-all">
              {publicKey.toBase58()}
            </div>
            <div className="mt-2 text-[10px] text-purple-700 dark:text-purple-300">
              Use this wallet for private payments
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6">
        {/* Wallet Overview Card */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Total Portfolio</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '0x742d...f44e'}
                </p>
              </div>
            </div>
            <IconWallet className="w-5 h-5 text-neon-green" />
          </div>

          <div className="mb-4">
            <h2 className="text-4xl font-bold text-black mb-1">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-gray-500">Total Value (USD)</p>
          </div>

          {/* Breakdown */}
          <div className="flex justify-center items-center text-center gap-12 pt-4 border-t border-gray-300">
            <div className="bg-white/60 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-neon-green" />
                <p className="text-xs text-gray-600">Actual Balance</p>
              </div>
              <p className="text-lg font-bold text-neon-green">
                ${actualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <p className="text-xs text-gray-600">Borrowed</p>
              </div>
              <p className="text-lg font-bold text-red-500">
                ${borrowedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Send and Receive */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setShowSendDialog(true)}
            className="flex-1 bg-neon-green text-black py-3 mr-2 rounded-2xl hover:bg-neon-green/80 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Send
          </button>
          <button
            onClick={() => setShowReceiveDialog(true)}
            className="flex-1 bg-solana-purple text-white py-3 ml-2 rounded-2xl hover:bg-solana-purple/80 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDownRight className="w-4 h-4" />
            Receive
          </button>
        </div>

        {/* Assets Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="w-1 h-6 bg-neon-green rounded-full"></div>
              Assets
            </h2>
          </div>

          <div className="space-y-3">
            {/* SOL */}
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="Solana Logo" className='w-8 h-8' />
                  <div>
                    <p className="font-bold text-lg">{solToken?.symbol || 'SOL'}</p>
                    <p className="text-xs text-gray-500">{solToken?.name || 'Solana'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{(solToken?.balance || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    ${solValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* USDC */}
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC Logo" className='w-8 h-8' />
                  <div>
                    <p className="font-bold text-lg">{usdcToken?.symbol || 'USDC'}</p>
                    <p className="text-xs text-gray-500">{usdcToken?.name || 'USD Coin'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{(usdcToken?.balance || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    ${usdcValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Send Dialog */}
      <AnimatePresence>
        {showSendDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSendDialog(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Send Crypto</h3>
                <button
                  onClick={() => setShowSendDialog(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Token Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Token</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedToken('SOL')}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedToken === 'SOL'
                          ? 'border-neon-green bg-neon-green/10'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6" />
                          <div className="text-left">
                            <p className="font-bold text-sm">SOL</p>
                            <p className="text-xs text-gray-500">{(solToken?.balance || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedToken('USDC')}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedToken === 'USDC'
                          ? 'border-neon-green bg-neon-green/10'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC" className="w-6 h-6" />
                          <div className="text-left">
                            <p className="font-bold text-sm">USDC</p>
                            <p className="text-xs text-gray-500">{(usdcToken?.balance || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recipient Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sendAddress}
                        onChange={(e) => setSendAddress(e.target.value)}
                        placeholder="Enter wallet address or ENS"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-neon-green outline-none transition-colors"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Scan className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Amount</label>
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="number"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          placeholder="0.00"
                          className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                        />
                        <span className="text-lg font-bold text-gray-500">{selectedToken}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Available: {getMaxBalance().toFixed(2)} {selectedToken}
                        </span>
                        <button
                          onClick={() => setSendAmount(getMaxBalance().toString())}
                          className="font-bold text-neon-green bg-neon-green/10 px-2 py-1 rounded uppercase hover:bg-neon-green/20 transition-colors"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Network Fee */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Network Fee</span>
                      <span className="font-bold text-black">~0.000005 SOL</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">≈ $0.0007 USD</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowSendDialog(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!sendAddress || !sendAmount || parseFloat(sendAmount) <= 0}
                      className="flex-1 bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send {selectedToken}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receive Dialog */}
      <AnimatePresence>
        {showReceiveDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiveDialog(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Receive Crypto</h3>
                <button
                  onClick={() => setShowReceiveDialog(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-6 rounded-2xl border-4 border-gray-200 shadow-lg mb-4">
                      <QRCodeSVG
                        value={walletAddress || '0x742d35a4b9473EdBfBd16b0bDd18e23A4f44e'}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center mb-2">
                      Scan this QR code to get the wallet address
                    </p>
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Your Wallet Address</label>
                    <div className="flex gap-2 items-center p-2">
                      <p className="text-sm font-mono text-black break-all text-center">
                        {walletAddress || '0x742d35a4b9473EdBfBd16b0bDd18e23A4f44e'}
                      </p>
                      <button
                        onClick={handleCopyAddress}
                        className="w-5 bg-white text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-neon-green" />
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setShowReceiveDialog(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
