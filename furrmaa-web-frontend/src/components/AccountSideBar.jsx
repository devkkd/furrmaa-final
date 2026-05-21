'use client'

import Link from 'next/link'
import { WALLET_UI_ENABLED } from '@/lib/featureFlags'
import {
  HiOutlineCube,
  HiOutlineUser,
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineBell,
  HiOutlineChatAlt2,
  HiOutlineThumbUp,
  HiOutlineHeart,
  HiOutlineCash,
  HiChevronRight,
} from 'react-icons/hi'

function Item({ href, icon, label, subLabel }) {
  return (
    <Link href={href} className="group block">
      <div className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="text-2xl text-gray-700 transition-colors group-hover:text-blue-600">
            {icon}
          </div>

          <div className="text-left">
            <h4 className="text-[15px] font-bold text-gray-900 leading-tight">
              {label}
            </h4>
            <p className="mt-0.5 text-[13px] text-gray-400">
              {subLabel}
            </p>
          </div>
        </div>

        <HiChevronRight className="text-xl text-gray-400 transition-colors group-hover:text-gray-600" />
      </div>
    </Link>
  )
}

export default function AccountSideBar() {
  return (
    <aside className="w-full max-w-[380px] bg-white p-6">
      <h1 className="mb-10 text-4xl font-extrabold text-gray-900">
        My Account
      </h1>

      <div className="space-y-8">

        {/* My Orders */}
        <div className="space-y-4">
          <h3 className="ml-1 text-sm font-semibold text-gray-500">
            My Orders
          </h3>
          <Item
            href="/account/orders"
            icon={<HiOutlineCube />}
            label="My Orders"
            subLabel="View all your orders"
          />
        </div>

        {/* Account and Address */}
        <div className="space-y-4">
          <h3 className="ml-1 text-sm font-semibold text-gray-500">
            Account and Address
          </h3>

          <div className="space-y-3">
            <Item
              href="/account"
              icon={<HiOutlineUser />}
              label="My Account"
              subLabel="Manage your account"
            />
            <Item
              href="/account/address"
              icon={<HiOutlineHome />}
              label="My Address"
              subLabel="Manage your address"
            />
            <Item
              href="/account/subscription"
              icon={<HiOutlineCreditCard />}
              label="My Subscription Plan"
              subLabel="Manage your subscription plan"
            />
            {WALLET_UI_ENABLED && (
              <Item
                href="/account/wallet"
                icon={<HiOutlineCash />}
                label="My Wallet"
                subLabel="Balance, recharge & history"
              />
            )}
            <Item
              href="/account/wishlist"
              icon={<HiOutlineHeart />}
              label="Wishlist"
              subLabel="Saved products"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="ml-1 text-sm font-semibold text-gray-500">
            Notifications
          </h3>
          <Item
            href="/account/notifications"
            icon={<HiOutlineBell />}
            label="Notifications"
            subLabel="See all notifications"
          />
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h3 className="ml-1 text-sm font-semibold text-gray-500">
            Support
          </h3>

          <div className="space-y-3">
            <Item
              href="/account/support"
              icon={<HiOutlineChatAlt2 />}
              label="Chat With Us"
              subLabel="If you have any concerns, chat with us"
            />
            <Item
              href="/account/feedback"
              icon={<HiOutlineThumbUp />}
              label="Share Feedback"
              subLabel="Help improve the Furrmaa app"
            />
          </div>
        </div>

      </div>
    </aside>
  )
}
