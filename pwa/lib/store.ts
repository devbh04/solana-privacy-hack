import { create } from 'zustand';

export interface Transaction {
  id: string;
  type: 'payment' | 'rotation' | 'blocked' | 'transfer' | 'lend' | 'borrow' | 'repay' | 'swap';
  merchant?: string;
  amount?: string;
  txHash?: string;
  status: 'completed' | 'blocked' | 'secure' | 'pending';
  timestamp: string;
  icon: string;
  message?: string;
}

export interface LendingActivity {
  id: string;
  amount: number;
  apy: number;
  lockPeriod: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'withdrawn';
  earned: number;
}

export interface BorrowingActivity {
  id: string;
  amount: number;
  interestRate: number;
  duration: string;
  borrowed: string;
  dueDate: string;
  status: 'active' | 'repaid' | 'overdue';
  totalDue: number;
  interestDue: number;
}

export interface RepayingActivity {
  id: string;
  loanId: string;
  amount: number;
  repaidDate: string;
  remainingBalance: number;
}

interface ProfileStats {
  creditScore: number;
  activeLoans: number;
  totalLent: string;
  totalBorrowed: string;
  creditLimit: number;
  creditUsed: number;
  balances: {
    total: string;
    borrowed: string;
    wallet: string;
  };
}

export interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  icon?: string;
}

interface SwapState {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  isTokenDialogOpen: boolean;
  selectingToken: 'from' | 'to' | null;
}

interface AppState {
  isAuthenticated: boolean;
  walletAddress: string | null;
  isActionDialogOpen: boolean;
  isHydrated: boolean;
  isCardFrozen: boolean;
  showCardDetails: boolean;
  balance: {
    sol: number;
    usd: number;
  };
  profileStats: ProfileStats;
  transactions: Transaction[];
  allActivities: Transaction[];
  lendingActivities: LendingActivity[];
  borrowingActivities: BorrowingActivity[];
  repayingActivities: RepayingActivity[];
  swapState: SwapState;
  setIsAuthenticated: (value: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  setIsActionDialogOpen: (value: boolean) => void;
  toggleCardFreeze: () => void;
  toggleCardDetails: () => void;
  rotateCardId: () => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  swapTokens: () => void;
  openTokenDialog: (selecting: 'from' | 'to') => void;
  closeTokenDialog: () => void;
  selectToken: (token: Token) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  initializeAuth: () => void;
}

const STORAGE_KEY = 'phantom_wallet_address';

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  walletAddress: null,
  isActionDialogOpen: false,
  isHydrated: false,
  isCardFrozen: false,
  showCardDetails: false,
  balance: {
    sol: 24.5,
    usd: 3420.50,
  },
  profileStats: {
    creditScore: 750,
    activeLoans: 2,
    totalLent: '$5,200',
    totalBorrowed: '$1,800',
    creditLimit: 5000,
    creditUsed: 600,
    balances: {
      total: '$8,420',
      borrowed: '$1,800',
      wallet: '$6,620',
    },
  },
  transactions: [
    {
      id: '1',
      type: 'payment',
      merchant: 'Starbucks Coffee',
      amount: '-0.12 SOL',
      txHash: '8x92...a4f2',
      status: 'completed',
      timestamp: '12:42 PM',
      icon: 'local_cafe',
    },
    {
      id: '2',
      type: 'rotation',
      merchant: 'Key Rotation',
      txHash: '0x99...22aa',
      status: 'secure',
      timestamp: 'Yesterday',
      icon: 'vpn_key',
      message: 'System Automated',
    },
    {
      id: '3',
      type: 'blocked',
      merchant: 'Blocked Attempt',
      status: 'blocked',
      timestamp: 'Nov 02',
      icon: 'block',
      message: 'IP: 192.168.0.X',
    },
  ],
  allActivities: [
    {
      id: 'a1',
      type: 'payment',
      merchant: 'Coffee Shop',
      amount: '-4.50 USDC',
      status: 'completed',
      timestamp: '10:42 AM',
      icon: 'local_cafe',
    },
    {
      id: 'a2',
      type: 'lend',
      merchant: 'Lending Pool',
      amount: '+500 USDC',
      status: 'completed',
      timestamp: '2 hours ago',
      icon: 'upload',
      message: 'Supplied to pool',
    },
    {
      id: 'a3',
      type: 'borrow',
      merchant: 'Borrow Position',
      amount: '-200 USDC',
      status: 'completed',
      timestamp: '1 day ago',
      icon: 'download',
      message: 'Borrowed against SOL',
    },
    {
      id: 'a4',
      type: 'repay',
      merchant: 'Loan Repayment',
      amount: '+150 USDC',
      status: 'completed',
      timestamp: '3 days ago',
      icon: 'payments',
      message: 'Partial repayment',
    },
    {
      id: 'a5',
      type: 'swap',
      merchant: 'Token Swap',
      amount: '2 SOL → 476 USDC',
      status: 'completed',
      timestamp: '5 days ago',
      icon: 'swap_horiz',
    },
  ],
  lendingActivities: [
    {
      id: 'l1',
      amount: 5000,
      apy: 8.5,
      lockPeriod: '90',
      startDate: '2026-01-01',
      endDate: '2026-04-01',
      status: 'active',
      earned: 106.16
    },
    {
      id: 'l2',
      amount: 3000,
      apy: 10.0,
      lockPeriod: '180',
      startDate: '2025-12-15',
      endDate: '2026-06-13',
      status: 'active',
      earned: 148.77
    }
  ],
  borrowingActivities: [
    {
      id: 'b1',
      amount: 600,
      interestRate: 4.0,
      duration: '90 Days',
      borrowed: '2026-01-10',
      dueDate: '2026-04-10',
      status: 'active',
      totalDue: 605.92,
      interestDue: 5.92
    },
    {
      id: 'b2',
      amount: 179,
      interestRate: 4.9,
      duration: '7 Days',
      borrowed: '2026-01-10',
      dueDate: '2026-01-17',
      status: 'active',
      totalDue: 100.92,
      interestDue: 5.92
    }
  ],
  repayingActivities: [
    {
      id: 'r1',
      loanId: 'b1',
      amount: 0,
      repaidDate: '2026-01-19',
      remainingBalance: 600
    }
  ],
  swapState: {
    fromToken: {
      symbol: 'SOL',
      name: 'Solana',
      balance: 14.24,
      price: 142.27,
      icon: 'https://cryptologos.cc/logos/solana-sol-logo.png'
    },
    toToken: {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 2400.00,
      price: 1.00,
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/USD_Coin_logo_%28cropped%29.png/960px-USD_Coin_logo_%28cropped%29.png'
    },
    fromAmount: '',
    toAmount: '',
    isTokenDialogOpen: false,
    selectingToken: null,
  },
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setIsActionDialogOpen: (value) => set({ isActionDialogOpen: value }),
  
  toggleCardFreeze: () => set((state) => ({ isCardFrozen: !state.isCardFrozen })),
  toggleCardDetails: () => set((state) => ({ showCardDetails: !state.showCardDetails })),
  
  setFromAmount: (amount: string) => set((state) => {
    const toAmount = amount ? (parseFloat(amount) * state.swapState.fromToken.price / state.swapState.toToken.price).toFixed(2) : '';
    return {
      swapState: {
        ...state.swapState,
        fromAmount: amount,
        toAmount,
      }
    };
  }),
  
  setToAmount: (amount: string) => set((state) => {
    const fromAmount = amount ? (parseFloat(amount) * state.swapState.toToken.price / state.swapState.fromToken.price).toFixed(2) : '';
    return {
      swapState: {
        ...state.swapState,
        toAmount: amount,
        fromAmount,
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
    if (state.swapState.selectingToken === 'from') {
      return {
        swapState: {
          ...state.swapState,
          fromToken: token,
          isTokenDialogOpen: false,
          selectingToken: null,
        }
      };
    } else {
      return {
        swapState: {
          ...state.swapState,
          toToken: token,
          isTokenDialogOpen: false,
          selectingToken: null,
        }
      };
    }
  }),
  
  rotateCardId: () => {
    const newHash = '0x' + Math.random().toString(16).substring(2, 8);
    set((state) => ({
      transactions: [
        {
          id: Date.now().toString(),
          type: 'rotation',
          merchant: 'Key Rotation',
          txHash: newHash,
          status: 'secure',
          timestamp: 'Just now',
          icon: 'vpn_key',
          message: 'Manual Rotation',
        },
        ...state.transactions,
      ],
    }));
  },
  
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem(STORAGE_KEY);
      if (storedAddress) {
        set({ 
          isAuthenticated: true, 
          walletAddress: storedAddress,
          isHydrated: true
        });
      } else {
        set({ isHydrated: true });
      }
    }
  },
  
  connectWallet: () => {
    // Simulate wallet connection
    const mockAddress = '0x' + Math.random().toString(16).substring(2, 42);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mockAddress);
    }
    
    set({ 
      isAuthenticated: true, 
      walletAddress: mockAddress 
    });
  },
  
  disconnectWallet: () => {
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    set({ 
      isAuthenticated: false, 
      walletAddress: null 
    });
  },
}));
