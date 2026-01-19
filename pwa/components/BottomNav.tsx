'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { IconCreditCard, IconTransfer, IconUser, IconWallet } from '@tabler/icons-react';

export function BottomNav() {
  const pathname = usePathname();
  const setIsActionDialogOpen = useAppStore((state) => state.setIsActionDialogOpen);

  const navItems = [
    { href: '/card-home', label: 'Card', icon: <IconCreditCard size={20} /> },
    { href: '/swap', label: 'Swap', icon: <IconTransfer size={20} /> },
    { href: '#', label: '', icon: '', isCenter: true },
    { href: '/wallet', label: 'Wallet', icon: <IconWallet size={20} /> },
    { href: '/profile-activity', label: 'Profile', icon: <IconUser size={20} /> },
  ];

  return (
    <nav className="fixed -bottom-0.5 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4 h-20 flex items-center">
        {navItems.map((item, index) => {
          if (item.isCenter) {
            return (
              <div key="center" className="flex-1 flex flex-col items-center gap-1">
                <button
                  onClick={() => setIsActionDialogOpen(true)}
                  className="relative -top-4 w-14 h-14 bg-neon-green hover:bg-white rounded-full flex items-center justify-center text-black text-2xl font-bold transition-all duration-200 shadow-lg shadow-neon-green/50"
                >
                  +
                </button>
              </div>
            );
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-neon-green border-b-2 border-neon-green' : 'text-gray-500 hover:text-black'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] uppercase tracking-wider font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
