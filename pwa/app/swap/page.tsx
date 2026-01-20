'use client';

import { useAppStore, Token } from '@/lib/store';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ArrowDownUp, Info, Zap, Shield, ChevronDown, X, Search } from 'lucide-react';

// Top 20 tokens with icons
const TOKENS: Token[] = [
  { symbol: 'SOL', name: 'Solana', balance: 14.24, price: 142.27, icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'USDC', name: 'USD Coin', balance: 2400.00, price: 1.00, icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { symbol: 'USDT', name: 'Tether', balance: 1500.00, price: 1.00, icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=040' },
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.5, price: 45000.00, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', balance: 2.5, price: 2500.00, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'BNB', name: 'Binance Coin', balance: 10, price: 320.00, icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040' },
  { symbol: 'RAY', name: 'Raydium', balance: 100, price: 1.50, icon: 'https://cryptologos.cc/logos/raydium-ray-logo.png' },
  { symbol: 'SRM', name: 'Serum', balance: 200, price: 0.75, icon: 'https://cryptologos.cc/logos/serum-srm-logo.svg?v=040' },
  { symbol: 'ORCA', name: 'Orca', balance: 150, price: 2.20, icon: 'https://cryptologos.cc/logos/orca-orca-logo.svg?v=040' },
  { symbol: 'MNGO', name: 'Mango', balance: 500, price: 0.30, icon: 'https://cryptologos.cc/logos/mango-markets-mngo-logo.png' },
];

export default function Swap() {
  const {
    swapState,
    setFromAmount,
    setToAmount,
    swapTokens,
    openTokenDialog,
    closeTokenDialog,
    selectToken,
    executeSwap,
    wallet
  } = useAppStore();

  const [incognitoMode, setIncognitoMode] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<Token[]>(TOKENS);

  const handleSwapClick = () => {
    setRotation(rotation + 180);
    setIsSwapping(true);
    setTimeout(() => {
      swapTokens();
      setIsSwapping(false);
    }, 300);
  };

  const handleMaxClick = () => {
    setFromAmount(swapState.fromToken.balance.toString());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTokens(TOKENS);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = TOKENS.filter(token =>
      token.symbol.toLowerCase().includes(lowercaseQuery) ||
      token.name.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredTokens(filtered);
  };

  const fromUsdValue = swapState.fromAmount
    ? (parseFloat(swapState.fromAmount) * swapState.fromToken.price).toFixed(2)
    : '0.00';

  // Clear search when dialog closes
  useEffect(() => {
    if (!swapState.isTokenDialogOpen) {
      setSearchQuery('');
      setFilteredTokens(TOKENS);
    }
  }, [swapState.isTokenDialogOpen]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-8 px-6 pb-2">
        <div className="">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-neon-green">$</span>
            <h1 className="text-3xl font-bold text-black">Swap</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-col flex-1 px-6 py-6 max-w-md mx-auto w-full">
        {/* From Input Card */}
        <motion.div
          animate={{
            y: isSwapping ? 100 : 0,
            opacity: isSwapping ? 0.5 : 1
          }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-200"
        >
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-500">From</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Balance: {swapState.fromToken.balance.toFixed(2)}</span>
              <button
                onClick={handleMaxClick}
                className="text-xs font-bold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded uppercase hover:bg-neon-green/20 transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              className="w-full bg-transparent border-none text-4xl font-semibold p-0 focus:ring-0 text-black placeholder-gray-300 outline-none"
              placeholder="0.00"
              type="number"
              value={swapState.fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <button
              onClick={() => openTokenDialog('from')}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full pl-2 pr-4 py-1.5 transition-colors border-2 border-gray-200 shrink-0"
            >
              {swapState.fromToken.icon ? (
                <img src={swapState.fromToken.icon} alt={swapState.fromToken.symbol} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-solana-purple to-neon-green flex items-center justify-center text-white text-xs font-bold">
                  {swapState.fromToken.symbol[0]}
                </div>
              )}
              <span className="font-bold text-lg">{swapState.fromToken.symbol}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2">≈ ${fromUsdValue}</p>
        </motion.div>

        {/* Swap Direction Button */}
        <div className="relative py-10 h-4 z-10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.button
              onClick={handleSwapClick}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: rotation }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-10 h-10 bg-white border-[3px] border-white rounded-xl flex items-center justify-center shadow-sm text-neon-green hover:scale-105 transition-transform"
            >
              <ArrowDownUp className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* To Input Card */}
        <motion.div
          animate={{
            y: isSwapping ? -100 : 0,
            opacity: isSwapping ? 0.5 : 1
          }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-200"
        >
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-500">To (Estimated)</label>
            <span className="text-xs text-gray-500">Balance: {swapState.toToken.balance.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              className="w-full bg-transparent border-none text-4xl font-semibold p-0 focus:ring-0 text-black placeholder-gray-300 opacity-90 outline-none"
              placeholder="0.00"
              readOnly
              type="number"
              value={swapState.toAmount}
            />
            <button
              onClick={() => openTokenDialog('to')}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full pl-2 pr-4 py-1.5 transition-colors border-2 border-gray-200 shrink-0"
            >
              {swapState.toToken.icon ? (
                <img src={swapState.toToken.icon} alt={swapState.toToken.symbol} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  $
                </div>
              )}
              <span className="font-bold text-lg">{swapState.toToken.symbol}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            1 {swapState.fromToken.symbol} ≈ {(swapState.fromToken.price / swapState.toToken.price).toFixed(2)} {swapState.toToken.symbol}
          </p>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Info & Privacy Section */}
        <div className="mt-6 pb-4 flex flex-col gap-3">
          {/* Rate Info */}
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-gray-700">
              <span className="text-sm font-medium">
                1 {swapState.fromToken.symbol} = {(swapState.fromToken.price / swapState.toToken.price).toFixed(2)} {swapState.toToken.symbol}
              </span>
              <Info className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3" /><path d="M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14" /><path d="M3 20l12 0" /><path d="M18 7v1a1 1 0 0 0 1 1h1" /><path d="M4 11l10 0" /></svg>
              <span className="text-sm font-medium text-gray-500">$0.002</span>
            </div>
          </div>
        </div>

        {/* Main Action Button */}
        <button
          onClick={executeSwap}
          disabled={!swapState.fromAmount || parseFloat(swapState.fromAmount) <= 0}
          className="w-full bg-solana-purple hover:bg-[#8532e8] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Swap</span>
          <ArrowDownUp className="w-5 h-5" />
        </button>
      </main>

      {/* Token Selection Dialog */}
      <AnimatePresence>
        {swapState.isTokenDialogOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTokenDialog}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Dialog */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Select Token</h3>
                <button
                  onClick={closeTokenDialog}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search token name or symbol..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-neon-green transition-colors placeholder-gray-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Token List */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {filteredTokens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No tokens found</p>
                    <p className="text-gray-400 text-sm mt-1">Try searching with a different name or symbol</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => selectToken(token)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors active:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          {token.icon ? (
                            <img src={token.icon} alt={token.symbol} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-solana-purple to-neon-green flex items-center justify-center text-white font-bold">
                              ${token.symbol[0]}
                            </div>
                          )}
                          <div className="text-left">
                            <p className="font-bold text-black">{token.symbol}</p>
                            <p className="text-xs text-gray-500">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-black">{token.balance.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">${(token.balance * token.price).toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}