'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HiOutlineEllipsisHorizontal } from 'react-icons/hi2'
import { WALLET_UI_ENABLED } from '@/lib/featureFlags'
import { HiOutlineBell, HiOutlineChatAlt2, HiOutlineCreditCard, HiOutlineCube, HiOutlineHeart, HiOutlineHome, HiOutlineCash, HiOutlineThumbUp, HiOutlineUser, HiX } from 'react-icons/hi'

export default function MobileBottomBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const mainTabs = [
    { label: 'Orders', href: '/account/orders', icon: HiOutlineCube },
    { label: 'Account', href: '/account', icon: HiOutlineUser },
    { label: 'Address', href: '/account/address', icon: HiOutlineHome },
    { label: 'Plans', href: '/account/subscription', icon: HiOutlineCreditCard },
  ]

  const moreTabs = [
    {
      label: 'Notifications',
      href: '/account/notifications',
      icon: HiOutlineBell,
    },
    {
      label: 'Chat With Us',
      href: '/account/support',
      icon: HiOutlineChatAlt2,
    },
    {
      label: 'Share Feedback',
      href: '/account/feedback',
      icon: HiOutlineThumbUp,
    },
    ...(WALLET_UI_ENABLED
      ? [{ label: 'Wallet', href: '/account/wallet', icon: HiOutlineCash }]
      : []),
    {
      label: 'Wishlist',
      href: '/account/wishlist',
      icon: HiOutlineHeart,
    },
  ]

  return (
    <>
      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
        <ul className="grid grid-cols-5">
          {mainTabs.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`flex flex-col items-center py-3 text-[11px]
                    ${active ? 'text-[#1F2E46]' : 'text-gray-400'}
                  `}
                >
                  <Icon className="text-xl mb-1" />
                  {label}
                </Link>
              </li>
            )
          })}

          {/* More */}
          <li>
            <button
              onClick={() => setOpen(true)}
              className="flex flex-col items-center py-3 text-[11px] text-gray-400 w-full"
            >
              <HiOutlineEllipsisHorizontal className="text-xl mb-1" />
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* More Drawer */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">More Options</h3>
              <button onClick={() => setOpen(false)}>
                <HiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-3">
              {moreTabs.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 rounded-xl border p-4"
                >
                  <Icon className="text-xl text-gray-700" />
                  <span className="font-medium text-sm">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
