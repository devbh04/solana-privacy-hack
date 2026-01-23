'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { IconDownload } from '@tabler/icons-react';
import { Handshake, Send, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ActionDialog() {
  const router = useRouter();
  const isOpen = useAppStore((state) => state.isActionDialogOpen);
  const setIsOpen = useAppStore((state) => state.setIsActionDialogOpen);

  const actions = [
    { 
      label: 'Lend', 
      href: '/lend',
      icon: <Handshake size={28} />,
      color: '#14F195',
      bgGradient: '',
      description: 'Earn yield on your assets'
    },
    { 
      label: 'Borrow', 
      href: '/borrow',
      icon: <IconDownload size={28} />,
      color: '#9945FF',
      bgGradient: '',
      description: 'Get instant liquidity'
    },
    { 
      label: 'Repay', 
      href: '/repay',
      icon: <Send size={28} />,
      color: '#3b82f6',
      bgGradient: '',
      description: 'Pay back your loans'
    },
    { 
      label: 'Private Payments', 
      href: '/private-payments',
      icon: <Lock size={28} />,
      color: '#8b5cf6',
      bgGradient: '',
      description: 'Send & receive privately'
    },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dialog positioned above button */}
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-28 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[calc(100%-3rem)] max-w-sm pointer-events-auto"
            >
              {/* Main Card */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-neon-green/5 to-transparent pointer-events-none" />
                
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                      <h2 className="text-lg font-bold text-black">Quick Actions</h2>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-6 space-y-2">
                  {actions.map((action, index) => (
                    <motion.button
                      key={action.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(action.href);
                      }}
                      className={`w-full bg-linear-to-r ${action.bgGradient} hover:shadow-lg border-2 border-gray-100 hover:border-opacity-50 text-black rounded-2xl p-4 transition-all duration-300 group relative overflow-hidden`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ borderColor: action.color + '20' }}
                    >
                      {/* Hover gradient effect */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      
                      <div className="relative flex items-center gap-4">
                        {/* Icon */}
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: action.color + '15' }}
                        >
                          <span style={{ color: action.color }}>
                            {action.icon}
                          </span>
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 text-left">
                          <div className="font-bold text-lg tracking-tight">{action.label}</div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">
                            {action.description}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div 
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                          style={{ color: action.color }}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Pointer Arrow */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex justify-center mt-3"
              >
                <div className="w-0 h-0 border-l-12 border-l-transparent border-r-12 border-r-transparent border-t-12 border-t-white/95" />
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
