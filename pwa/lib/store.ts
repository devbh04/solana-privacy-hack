import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============== TYPES ==============

export interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: string;
  merchant: string;
  amount?: number;
  txHash: string;
  status: string;
  timestamp: string;
  icon: string;
  message?: string;
  from?: string;
  to?: string;
}

export interface LendingPosition {
  id: string;
  amount: number;
  apy: number;
  lockPeriodDays: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'withdrawn';
  earnedInterest: number;
}

export interface BorrowingPosition {
  id: string;
  principal: number;
  interestRate: number;
  durationDays: number;
  borrowedDate: string;
  dueDate: string;
  status: 'active' | 'repaid' | 'defaulted';
  accruedInterest: number;
  totalDue: number;
}

interface WalletState {
  tokens: Token[];
}

interface SwapState {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  isTokenDialogOpen: boolean;
  selectingToken: 'from' | 'to' | null;
}

export interface Activity {
  id: string;
  type: 'payment' | 'lend' | 'borrow' | 'repay' | 'swap' | 'transfer';
  title: string;
  description: string;
  amount?: number;
  token?: string;
  timestamp: string;
  status?: string;
  details?: {
    from?: string;
    to?: string;
    txHash?: string;
    interestRate?: number;
    apy?: number;
    duration?: number;
  };
}

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  walletAddress: string | null;
  isHydrated: boolean;
  
  // Solana Wallet Integration
  solanaWalletAddress: string | null;
  isSolanaWalletConnected: boolean;
  
  setIsAuthenticated: (value: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  setSolanaWallet: (address: string | null, connected: boolean) => void;
  initializeAuth: () => void;
  connectWallet: () => void;
  disconnectWallet: () => void;

  // UI State
  isActionDialogOpen: boolean;
  isCardFrozen: boolean;
  showCardDetails: boolean;
  setIsActionDialogOpen: (value: boolean) => void;
  toggleCardFreeze: () => void;
  toggleCardDetails: () => void;
  rotateCardId: () => void;

  // Wallet Management
  wallet: WalletState;
  
  // Core Financial State
  // On-chain reputation score (0-1000) - higher is better
  onChainScore: number;
  
  // Total USDC lent to the pool (increases credit limit)
  totalLentToPool: number;
  
  // Total USDC borrowed from pool (including card payments)
  totalBorrowed: number;
  
  // Separate tracking of card payment debt
  cardPaymentDebt: number;
  
  // Active positions
  lendingPositions: LendingPosition[];
  borrowingPositions: BorrowingPosition[];
  
  // All activities (payments, borrows, lends, repays, swaps)
  allActivities: Activity[];
  transactions: Transaction[];
  
  // Credit Score (700-850 scale, calculated from on-chain score)
  creditScore: number;
  
  // Swap State
  swapState: SwapState;
  
  // Computed Values
  getUsdcBalance: () => number;
  getActualUsdcBalance: () => number; // USDC that's actually owned
  getBorrowedUsdcBalance: () => number; // USDC that's borrowed
  getCreditLimit: () => number; // Based on lending + on-chain score
  getCreditUsed: () => number; // Total borrowed + card debt
  getAvailableCredit: () => number; // Credit limit - credit used
  getCreditUtilization: () => number; // (Credit used / Credit limit) * 100
  getTotalWalletValue: () => number;
  getProfileStats: () => any;
  
  // Actions
  // Swap
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  swapTokens: () => void;
  openTokenDialog: (selecting: 'from' | 'to') => void;
  closeTokenDialog: () => void;
  selectToken: (token: Token) => void;
  executeSwap: () => void;
  
  // Lending
  lendUsdc: (amount: number, lockPeriodDays: number) => boolean;
  withdrawLending: (positionId: string) => boolean;
  
  // Borrowing
  borrowUsdc: (amount: number, durationDays: number) => boolean;
  repayLoan: (loanId: string, amount: number) => boolean;
  
  // Card Payments
  makeCardPayment: (merchantName: string, amount: number) => boolean;
  
  // Activities
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  
  // Legacy compatibility
  balance: { sol: number; usd: number };
  actualUsdcBalance: number;
  borrowedUsdcBalance: number;
  totalLent: number;
}

// ============== INITIAL DATA ==============

const AVAILABLE_TOKENS: Token[] = [
  { symbol: 'SOL', name: 'Solana', balance: 14.24, price: 142.27, icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'USDC', name: 'USD Coin', balance: 1200.00, price: 1.00, icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { symbol: 'USDT', name: 'Tether', balance: 500.00, price: 1.00, icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=040' },
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.02, price: 45000.00, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', balance: 0.5, price: 2500.00, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'BNB', name: 'Binance Coin', balance: 2, price: 320.00, icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040' },
  { symbol: 'RAY', name: 'Raydium', balance: 100, price: 1.50, icon: 'https://cryptologos.cc/logos/raydium-ray-logo.png' },
  { symbol: 'SRM', name: 'Serum', balance: 50, price: 0.75, icon: 'https://cryptologos.cc/logos/serum-srm-logo.svg?v=040' },
  { symbol: 'ORCA', name: 'Orca', balance: 30, price: 2.20, icon: 'https://cryptologos.cc/logos/orca-orca-logo.svg?v=040' },
  { symbol: 'MNGO', name: 'Mango', balance: 200, price: 0.30, icon: 'https://cryptologos.cc/logos/mango-markets-mngo-logo.png' },
];

// Generate simulated activities based on app logic
function generateSimulatedActivities(): Activity[] {
  return [
    {
      id: 'act-1',
      type: 'payment',
      title: 'Card Payment',
      description: 'Starbucks - Downtown',
      amount: 6.50,
      token: 'USDC',
      timestamp: '2 hours ago',
      status: 'completed',
      details: {
        txHash: '0x1a2b3c...4d5e6f',
      }
    },
    {
      id: 'act-2',
      type: 'swap',
      title: 'Swapped Assets',
      description: 'Exchange for lending',
      amount: 150,
      token: 'USDC',
      timestamp: '5 hours ago',
      status: 'completed',
      details: {
        from: 'ETH',
        to: 'USDC',
        txHash: '0x9f8e7d...6c5b4a',
      }
    },
    {
      id: 'act-3',
      type: 'payment',
      title: 'Card Payment',
      description: 'Netflix Subscription',
      amount: 15.99,
      token: 'USDC',
      timestamp: '1 day ago',
      status: 'completed',
      details: {
        txHash: '0x2c3d4e...5f6g7h',
      }
    },
    {
      id: 'act-4',
      type: 'lend',
      title: 'Lent to Pool',
      description: '90-day lock • 8.5% APY',
      amount: 3000,
      token: 'USDC',
      timestamp: '2 days ago',
      status: 'completed',
      details: {
        apy: 8.5,
        duration: 90,
        txHash: '0x2b3c4d...5e6f7g',
      }
    },
    {
      id: 'act-5',
      type: 'swap',
      title: 'Swapped Assets',
      description: 'Portfolio rebalancing',
      amount: 500,
      token: 'USDC',
      timestamp: '3 days ago',
      status: 'completed',
      details: {
        from: 'SOL',
        to: 'USDC',
        txHash: '0x4d5e6f...7g8h9i',
      }
    },
    {
      id: 'act-6',
      type: 'borrow',
      title: 'Borrowed from Pool',
      description: '90-day term • 4% APR',
      amount: 600,
      token: 'USDC',
      timestamp: '4 days ago',
      status: 'completed',
      details: {
        interestRate: 4.0,
        duration: 90,
        txHash: '0x3c4d5e...6f7g8h',
      }
    },
    {
      id: 'act-7',
      type: 'payment',
      title: 'Card Payment',
      description: 'Whole Foods Market',
      amount: 127.43,
      token: 'USDC',
      timestamp: '5 days ago',
      status: 'completed',
      details: {
        txHash: '0x8h9i0j...1k2l3m',
      }
    },
    {
      id: 'act-8',
      type: 'swap',
      title: 'Swapped Assets',
      description: 'Converted to stablecoin',
      amount: 250,
      token: 'USDC',
      timestamp: '6 days ago',
      status: 'completed',
      details: {
        from: 'BTC',
        to: 'USDC',
        txHash: '0x5f6g7h...8i9j0k',
      }
    },
    {
      id: 'act-9',
      type: 'payment',
      title: 'Card Payment',
      description: 'Amazon.com',
      amount: 89.99,
      token: 'USDC',
      timestamp: '1 week ago',
      status: 'completed',
      details: {
        txHash: '0x5e6f7g...8h9i0j',
      }
    },
    {
      id: 'act-10',
      type: 'repay',
      title: 'Loan Repayment',
      description: 'Partial payment',
      amount: 150,
      token: 'USDC',
      timestamp: '1 week ago',
      status: 'completed',
      details: {
        txHash: '0x6f7g8h...9i0j1k',
      }
    },
    {
      id: 'act-11',
      type: 'payment',
      title: 'Card Payment',
      description: 'Shell Gas Station',
      amount: 45.00,
      token: 'USDC',
      timestamp: '1 week ago',
      status: 'completed',
      details: {
        txHash: '0x7g8h9i...0j1k2l',
      }
    },
    {
      id: 'act-12',
      type: 'transfer',
      title: 'Withdrew from Pool',
      description: 'Principal + Interest',
      amount: 1052.30,
      token: 'USDC',
      timestamp: '2 weeks ago',
      status: 'completed',
      details: {
        txHash: '0x2p3q4r...5s6t7u',
      }
    },
    {
      id: 'act-13',
      type: 'swap',
      title: 'Swapped Assets',
      description: 'DeFi position adjustment',
      amount: 75,
      token: 'USDC',
      timestamp: '2 weeks ago',
      status: 'completed',
      details: {
        from: 'RAY',
        to: 'USDC',
        txHash: '0x3m4n5o...6p7q8r',
      }
    },
    {
      id: 'act-14',
      type: 'payment',
      title: 'Card Payment',
      description: 'Spotify Premium',
      amount: 10.99,
      token: 'USDC',
      timestamp: '2 weeks ago',
      status: 'completed',
      details: {
        txHash: '0x9s8t7u...6v5w4x',
      }
    },
    {
      id: 'act-15',
      type: 'lend',
      title: 'Lent to Pool',
      description: '60-day lock • 7.5% APY',
      amount: 1000,
      token: 'USDC',
      timestamp: '3 weeks ago',
      status: 'completed',
      details: {
        apy: 7.5,
        duration: 60,
        txHash: '0x4v5w6x...7y8z9a',
      }
    },
  ];
}

// ============== STORE ==============

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Authentication
      isAuthenticated: false,
      walletAddress: null,
      isHydrated: false,
      
      // Solana Wallet
      solanaWalletAddress: null,
      isSolanaWalletConnected: false,

      // UI State
      isActionDialogOpen: false,
      isCardFrozen: false,
      showCardDetails: false,

      // Wallet
      wallet: {
        tokens: AVAILABLE_TOKENS,
      },

      // Core Financial State
      onChainScore: 750, // Score out of 1000
      totalLentToPool: 3000, // USDC lent to pool
      totalBorrowed: 600, // USDC borrowed (excluding card debt)
      cardPaymentDebt: 141.49, // Debt from card payments (6.50 + 89.99 + 45.00)
      
      // Positions
      lendingPositions: [
        {
          id: 'lend-1',
          amount: 3000,
          apy: 8.5,
          lockPeriodDays: 90,
          startDate: '2025-11-22',
          endDate: '2026-02-20',
          status: 'active',
          earnedInterest: 52.60 // (3000 * 0.085 * 60) / 365
        },
      ],
      borrowingPositions: [
        {
          id: 'borrow-1',
          principal: 600,
          interestRate: 4.0,
          durationDays: 90,
          borrowedDate: '2026-01-07',
          dueDate: '2026-04-07',
          status: 'active',
          accruedInterest: 3.45, // (600 * 0.04 * 13) / 365
          totalDue: 603.45
        },
      ],

      // Activities
      allActivities: generateSimulatedActivities(),
      transactions: [
        {
          id: '1',
          type: 'rotation',
          merchant: 'Key Rotation',
          txHash: '0x99...22aa',
          status: 'secure',
          timestamp: 'Yesterday',
          icon: 'vpn_key',
          message: 'System Automated',
        },
      ],

      // Credit Score (converted from on-chain score)
      creditScore: 750, // 700-850 scale

      // Swap State
      swapState: {
        fromToken: AVAILABLE_TOKENS[0], // SOL
        toToken: AVAILABLE_TOKENS[1],   // USDC
        fromAmount: '',
        toAmount: '',
        isTokenDialogOpen: false,
        selectingToken: null,
      },

      // Legacy compatibility
      balance: {
        sol: 14.24,
        usd: 0,
      },
      actualUsdcBalance: 0, // Computed
      borrowedUsdcBalance: 0, // Computed
      totalLent: 0, // Computed

      // ============== COMPUTED VALUES ==============

      getUsdcBalance: () => {
        const state = get();
        const usdcToken = state.wallet.tokens.find(t => t.symbol === 'USDC');
        return usdcToken?.balance || 0;
      },

      getActualUsdcBalance: () => {
        const state = get();
        const totalUsdc = state.getUsdcBalance();
        const borrowedUsdc = state.totalBorrowed + state.cardPaymentDebt;
        return Math.max(0, totalUsdc - borrowedUsdc);
      },

      getBorrowedUsdcBalance: () => {
        const state = get();
        return state.totalBorrowed + state.cardPaymentDebt;
      },

      getCreditLimit: () => {
        const state = get();
        // Credit limit formula:
        // Base limit from on-chain score: (score / 1000) * 5000
        // Bonus from lending: totalLentToPool * 1.5
        const baseLimit = (state.onChainScore / 1000) * 5000;
        const lendingBonus = state.totalLentToPool * 1.5;
        return Math.floor(baseLimit + lendingBonus);
      },

      getCreditUsed: () => {
        const state = get();
        // Credit used = total borrowed + card payment debt
        return state.totalBorrowed + state.cardPaymentDebt;
      },

      getAvailableCredit: () => {
        const state = get();
        const limit = state.getCreditLimit();
        const used = state.getCreditUsed();
        return Math.max(0, limit - used);
      },

      getCreditUtilization: () => {
        const state = get();
        const limit = state.getCreditLimit();
        if (limit === 0) return 0;
        const used = state.getCreditUsed();
        return Math.round((used / limit) * 100);
      },

      getTotalWalletValue: () => {
        const state = get();
        return state.wallet.tokens.reduce((sum, token) => {
          return sum + (token.balance * token.price);
        }, 0);
      },

      getProfileStats: () => {
        const state = get();
        const totalLent = state.lendingPositions
          .filter(p => p.status === 'active')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const totalEarned = state.lendingPositions
          .reduce((sum, p) => sum + p.earnedInterest, 0);
        
        const totalRepaid = state.allActivities
          .filter(a => a.type === 'repay')
          .reduce((sum, a) => sum + (a.amount || 0), 0);

        return {
          totalLent,
          totalBorrowed: state.totalBorrowed,
          totalEarned,
          totalRepaid,
          creditLimit: state.getCreditLimit(),
          creditUsed: state.getCreditUsed(),
          availableCredit: state.getAvailableCredit(),
          creditScore: state.creditScore,
          balances: {
            wallet: `$${state.getTotalWalletValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            borrowed: `$${state.getCreditUsed().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            total: `$${state.totalLentToPool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
        };
      },

      // ============== ACTIONS ==============

      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setWalletAddress: (address) => set({ walletAddress: address }),
      setSolanaWallet: (address, connected) => set({ 
        solanaWalletAddress: address, 
        isSolanaWalletConnected: connected 
      }),

      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const savedAuth = localStorage.getItem('isAuthenticated');
          const savedAddress = localStorage.getItem('walletAddress');
          set({
            isAuthenticated: savedAuth === 'true',
            walletAddress: savedAddress,
            isHydrated: true,
          });
        } else {
          set({ isHydrated: true });
        }
      },

      connectWallet: () => {
        const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f44e';
        set({ isAuthenticated: true, walletAddress: mockAddress });
        if (typeof window !== 'undefined') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('walletAddress', mockAddress);
        }
      },

      disconnectWallet: () => {
        set({ isAuthenticated: false, walletAddress: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('walletAddress');
        }
      },

      setIsActionDialogOpen: (value) => set({ isActionDialogOpen: value }),
      toggleCardFreeze: () => set((state) => ({ isCardFrozen: !state.isCardFrozen })),
      toggleCardDetails: () => set((state) => ({ showCardDetails: !state.showCardDetails })),

      rotateCardId: () => {
        const txHash = '0x' + Math.random().toString(16).substr(2, 8);
        set((state) => ({
          transactions: [
            {
              id: Date.now().toString(),
              type: 'rotation',
              merchant: 'Key Rotation',
              txHash,
              status: 'secure',
              timestamp: 'Just now',
              icon: 'vpn_key',
              message: 'Manual Rotation',
            },
            ...state.transactions,
          ],
        }));
      },

      // ============== SWAP ==============

      setFromAmount: (amount: string) => set((state) => {
        const fromToken = state.swapState.fromToken;
        const toToken = state.swapState.toToken;
        const fromValue = parseFloat(amount) || 0;
        const toValue = (fromValue * fromToken.price) / toToken.price;
        
        return {
          swapState: {
            ...state.swapState,
            fromAmount: amount,
            toAmount: toValue > 0 ? toValue.toFixed(6) : '',
          }
        };
      }),

      setToAmount: (amount: string) => set((state) => {
        const fromToken = state.swapState.fromToken;
        const toToken = state.swapState.toToken;
        const toValue = parseFloat(amount) || 0;
        const fromValue = (toValue * toToken.price) / fromToken.price;
        
        return {
          swapState: {
            ...state.swapState,
            toAmount: amount,
            fromAmount: fromValue > 0 ? fromValue.toFixed(6) : '',
          }
        };
      }),

      swapTokens: () => set((state) => ({
        swapState: {
          ...state.swapState,
          fromToken: state.swapState.toToken,
          toToken: state.swapState.fromToken,
          fromAmount: state.swapState.toAmount,
          toAmount: state.swapState.fromAmount,
        }
      })),

      openTokenDialog: (selecting: 'from' | 'to') => set((state) => ({
        swapState: {
          ...state.swapState,
          isTokenDialogOpen: true,
          selectingToken: selecting,
        }
      })),

      closeTokenDialog: () => set((state) => ({
        swapState: {
          ...state.swapState,
          isTokenDialogOpen: false,
          selectingToken: null,
        }
      })),

      selectToken: (token: Token) => set((state) => {
        const selecting = state.swapState.selectingToken;
        if (!selecting) return state;

        if (selecting === 'from') {
          const toToken = state.swapState.toToken.symbol === token.symbol 
            ? state.swapState.fromToken 
            : state.swapState.toToken;
          
          return {
            swapState: {
              ...state.swapState,
              fromToken: token,
              toToken,
              isTokenDialogOpen: false,
              selectingToken: null,
            }
          };
        } else {
          const fromToken = state.swapState.fromToken.symbol === token.symbol 
            ? state.swapState.toToken 
            : state.swapState.fromToken;
          
          return {
            swapState: {
              ...state.swapState,
              toToken: token,
              fromToken,
              isTokenDialogOpen: false,
              selectingToken: null,
            }
          };
        }
      }),

      executeSwap: () => {
        const state = get();
        const { fromToken, toToken, fromAmount } = state.swapState;
        const amount = parseFloat(fromAmount);

        if (!amount || amount <= 0) {
          alert('Please enter a valid amount');
          return;
        }

        if (amount > fromToken.balance) {
          alert('Insufficient balance');
          return;
        }

        const toAmount = (amount * fromToken.price) / toToken.price;

        // Update token balances
        const updatedTokens = state.wallet.tokens.map(token => {
          if (token.symbol === fromToken.symbol) {
            return { ...token, balance: token.balance - amount };
          }
          if (token.symbol === toToken.symbol) {
            return { ...token, balance: token.balance + toAmount };
          }
          return token;
        });

        // Add activity
        const activity: Activity = {
          id: `swap-${Date.now()}`,
          type: 'swap',
          title: 'Swapped Assets',
          description: `${fromToken.symbol} → ${toToken.symbol}`,
          amount: toAmount,
          token: toToken.symbol,
          timestamp: 'Just now',
          status: 'completed',
          details: {
            from: fromToken.symbol,
            to: toToken.symbol,
            txHash: '0x' + Math.random().toString(16).substr(2, 40),
          }
        };

        set({
          wallet: { tokens: updatedTokens },
          swapState: {
            ...state.swapState,
            fromAmount: '',
            toAmount: '',
          },
          allActivities: [activity, ...state.allActivities],
        });
      },

      // ============== LENDING ==============

      lendUsdc: (amount: number, lockPeriodDays: number) => {
        const state = get();
        const usdcBalance = state.getActualUsdcBalance();

        if (amount <= 0) {
          alert('Please enter a valid amount');
          return false;
        }

        if (amount > usdcBalance) {
          alert('Insufficient USDC balance');
          return false;
        }

        // Calculate APY based on lock period
        const apyMap: { [key: number]: number } = {
          7: 5.0, 30: 6.5, 60: 7.5, 90: 8.5, 120: 9.0,
          180: 10.0, 210: 10.5, 240: 11.0, 270: 11.5, 300: 12.0, 365: 12.5
        };
        const apy = apyMap[lockPeriodDays] || 8.5;

        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + lockPeriodDays);

        const newPosition: LendingPosition = {
          id: `lend-${Date.now()}`,
          amount,
          apy,
          lockPeriodDays,
          startDate: today.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: 'active',
          earnedInterest: 0,
        };

        // Deduct USDC from wallet
        const updatedTokens = state.wallet.tokens.map(token => {
          if (token.symbol === 'USDC') {
            return { ...token, balance: token.balance - amount };
          }
          return token;
        });

        // Add activity
        const activity: Activity = {
          id: `lend-act-${Date.now()}`,
          type: 'lend',
          title: 'Lent to Pool',
          description: `${lockPeriodDays}-day lock period`,
          amount,
          token: 'USDC',
          timestamp: 'Just now',
          status: 'completed',
          details: {
            apy,
            duration: lockPeriodDays,
            txHash: '0x' + Math.random().toString(16).substr(2, 40),
          }
        };

        set({
          lendingPositions: [...state.lendingPositions, newPosition],
          totalLentToPool: state.totalLentToPool + amount,
          wallet: { tokens: updatedTokens },
          allActivities: [activity, ...state.allActivities],
        });

        return true;
      },

      withdrawLending: (positionId: string) => {
        const state = get();
        const position = state.lendingPositions.find(p => p.id === positionId);

        if (!position || position.status !== 'active') {
          alert('Position not found or already withdrawn');
          return false;
        }

        const today = new Date();
        const endDate = new Date(position.endDate);

        if (today < endDate) {
          alert('Position is still locked. Early withdrawal not available.');
          return false;
        }

        const totalReturn = position.amount + position.earnedInterest;

        // Add USDC back to wallet
        const updatedTokens = state.wallet.tokens.map(token => {
          if (token.symbol === 'USDC') {
            return { ...token, balance: token.balance + totalReturn };
          }
          return token;
        });

        // Update position
        const updatedPositions = state.lendingPositions.map(p => {
          if (p.id === positionId) {
            return { ...p, status: 'completed' as const };
          }
          return p;
        });

        // Add activity
        const activity: Activity = {
          id: `withdraw-${Date.now()}`,
          type: 'transfer',
          title: 'Withdrew from Pool',
          description: `Principal + Interest`,
          amount: totalReturn,
          token: 'USDC',
          timestamp: 'Just now',
          status: 'completed',
          details: {
            txHash: '0x' + Math.random().toString(16).substr(2, 40),
          }
        };

        set({
          lendingPositions: updatedPositions,
          totalLentToPool: state.totalLentToPool - position.amount,
          wallet: { tokens: updatedTokens },
          allActivities: [activity, ...state.allActivities],
        });

        return true;
      },

      // ============== BORROWING ==============

      borrowUsdc: (amount: number, durationDays: number) => {
        const state = get();
        const availableCredit = state.getAvailableCredit();

        if (amount <= 0) {
          alert('Please enter a valid amount');
          return false;
        }

        if (amount > availableCredit) {
          alert(`Insufficient credit. Available: $${availableCredit.toFixed(2)}`);
          return false;
        }

        // Calculate interest rate based on credit score
        const baseRate = 4.5;
        const creditScoreBonus = state.creditScore >= 750 ? 0.5 : 0;
        const interestRate = baseRate - creditScoreBonus;

        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + durationDays);

        const totalInterest = (amount * interestRate * durationDays) / (365 * 100);
        const totalDue = amount + totalInterest;

        const newBorrowing: BorrowingPosition = {
          id: `borrow-${Date.now()}`,
          principal: amount,
          interestRate,
          durationDays,
          borrowedDate: today.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'active',
          accruedInterest: 0,
          totalDue,
        };

        // Add USDC to wallet (borrowed funds)
        const updatedTokens = state.wallet.tokens.map(token => {
          if (token.symbol === 'USDC') {
            return { ...token, balance: token.balance + amount };
          }
          return token;
        });

        // Add activity
        const activity: Activity = {
          id: `borrow-act-${Date.now()}`,
          type: 'borrow',
          title: 'Borrowed from Pool',
          description: `${durationDays}-day term`,
          amount,
          token: 'USDC',
          timestamp: 'Just now',
          status: 'completed',
          details: {
            interestRate,
            duration: durationDays,
            txHash: '0x' + Math.random().toString(16).substr(2, 40),
          }
        };

        set({
          borrowingPositions: [...state.borrowingPositions, newBorrowing],
          totalBorrowed: state.totalBorrowed + amount,
          wallet: { tokens: updatedTokens },
          allActivities: [activity, ...state.allActivities],
        });

        return true;
      },

      repayLoan: (loanId: string, amount: number) => {
        const state = get();
        const loan = state.borrowingPositions.find(l => l.id === loanId);

        if (!loan || loan.status !== 'active') {
          alert('Loan not found or already repaid');
          return false;
        }

        if (amount <= 0) {
          alert('Please enter a valid amount');
          return false;
        }

        // Calculate current accrued interest
        const today = new Date();
        const borrowedDate = new Date(loan.borrowedDate);
        const daysPassed = Math.floor((today.getTime() - borrowedDate.getTime()) / (1000 * 60 * 60 * 24));
        const accruedInterest = (loan.principal * loan.interestRate * daysPassed) / (365 * 100);
        const currentTotalDue = loan.principal + accruedInterest;

        if (amount > currentTotalDue) {
          alert(`Repayment amount exceeds total due: $${currentTotalDue.toFixed(2)}`);
          return false;
        }

        const usdcBalance = state.getUsdcBalance();
        if (amount > usdcBalance) {
          alert('Insufficient USDC balance');
          return false;
        }

        // Deduct USDC from wallet
        const updatedTokens = state.wallet.tokens.map(token => {
          if (token.symbol === 'USDC') {
            return { ...token, balance: token.balance - amount };
          }
          return token;
        });

        // Update loan
        const newPrincipal = Math.max(0, loan.principal - amount);
        const isFullyRepaid = newPrincipal === 0;

        const updatedLoans = state.borrowingPositions.map(l => {
          if (l.id === loanId) {
            return {
              ...l,
              principal: newPrincipal,
              status: isFullyRepaid ? 'repaid' as const : l.status,
              accruedInterest,
              totalDue: newPrincipal + (isFullyRepaid ? 0 : accruedInterest),
            };
          }
          return l;
        });

        // Update total borrowed
        const borrowedReduction = Math.min(amount, loan.principal);

        // Add activity
        const activity: Activity = {
          id: `repay-${Date.now()}`,
          type: 'repay',
          title: 'Loan Repayment',
          description: isFullyRepaid ? 'Full repayment' : 'Partial repayment',
          amount,
          token: 'USDC',
          timestamp: 'Just now',
          status: 'completed',
          details: {
            txHash: '0x' + Math.random().toString(16).substr(2, 40),
          }
        };

        set({
          borrowingPositions: updatedLoans,
          totalBorrowed: state.totalBorrowed - borrowedReduction,
          wallet: { tokens: updatedTokens },
          allActivities: [activity, ...state.allActivities],
        });

        return true;
      },

      // ============== CARD PAYMENTS ==============

      makeCardPayment: (merchantName: string, amount: number) => {
        const state = get();
        
        if (state.isCardFrozen) {
          alert('Card is frozen. Please unfreeze to make payments.');
          return false;
        }

        const availableCredit = state.getAvailableCredit();
        
        if (amount > availableCredit) {
          alert(`Insufficient credit. Available: $${availableCredit.toFixed(2)}`);
          return false;
        }

        // Step 1: Borrow the amount needed for payment
        // Step 2: Add to wallet
        // Step 3: Make payment (deduct from wallet)
        // This is all instant, so we just track the debt

        // Add USDC temporarily (borrowed for payment)
        const updatedTokens = state.wallet.tokens.map(token => {
          if (token.symbol === 'USDC') {
            // Add borrowed amount, then immediately deduct for payment
            // Net effect: balance stays same, but we track card debt
            return token;
          }
          return token;
        });

        // Add payment transaction
        const transaction: Transaction = {
          id: `pay-${Date.now()}`,
          type: 'payment',
          merchant: merchantName,
          amount,
          txHash: '0x' + Math.random().toString(16).substr(2, 40),
          status: 'completed',
          timestamp: 'Just now',
          icon: 'payments',
        };

        // Add activity
        const activity: Activity = {
          id: `payment-act-${Date.now()}`,
          type: 'payment',
          title: 'Card Payment',
          description: merchantName,
          amount,
          token: 'USDC',
          timestamp: 'Just now',
          status: 'completed',
          details: {
            txHash: transaction.txHash,
          }
        };

        set({
          cardPaymentDebt: state.cardPaymentDebt + amount,
          wallet: { tokens: updatedTokens },
          transactions: [transaction, ...state.transactions],
          allActivities: [activity, ...state.allActivities],
        });

        return true;
      },

      // ============== ACTIVITIES ==============

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
        };
        
        set((state) => ({
          allActivities: [newActivity, ...state.allActivities],
        }));
      },
    }),
    {
      name: 'phantom-card-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        walletAddress: state.walletAddress,
        wallet: state.wallet,
        onChainScore: state.onChainScore,
        totalLentToPool: state.totalLentToPool,
        totalBorrowed: state.totalBorrowed,
        cardPaymentDebt: state.cardPaymentDebt,
        lendingPositions: state.lendingPositions,
        borrowingPositions: state.borrowingPositions,
        allActivities: state.allActivities,
        transactions: state.transactions,
        creditScore: state.creditScore,
      }),
    }
  )
);

// Type exports for backwards compatibility
export type { LendingPosition as LendingActivity };
export type { BorrowingPosition as BorrowingActivity };
