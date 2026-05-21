'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Container from '@/components/Container';
import { HiArrowLeft, HiDownload } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import { IoCheckmarkCircle } from 'react-icons/io5';
import Link from 'next/link';
import { fetchOrderById } from '@/lib/api';
import ProductInfoCard from '@/components/ProductInfoCard';

const OrderDetails = () => {
  const { order_id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order_id) return;
    let cancelled = false;
    setLoading(true);
    fetchOrderById(order_id)
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrder(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [order_id]);

  if (loading) {
    return (
      <section className="bg-white min-h-screen py-6 md:py-10">
        <Container>
          <div className="p-10 text-center text-gray-500">Loading order details...</div>
        </Container>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="bg-white min-h-screen py-6 md:py-10">
        <Container>
          <div className="p-10 text-center">
            <p className="text-gray-700 mb-4">Order not found.</p>
            <Link href="/account/orders" className="text-[#1F2E46] font-medium hover:underline">
              ← Back to Orders
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white min-h-screen py-6 md:py-10">
      <Container>
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button className="p-2 hover:bg-white rounded-full transition-all">
            <HiArrowLeft className="text-2xl text-gray-800" />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders Details</h1>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Grid 1: Product Details (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <ProductInfoCard order={order}/>
          </div>

          {/* Grid 2: Price, Rating & Return (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <PriceDetailsCard order={order}/>
            <RatingCard />
            <Link href={`/account/orders/return-request/${order._id}`}>
            <ReturnOrderCard />
            </Link>
          </div>

          {/* Grid 3: Order Update / Tracking (4 Columns) */}
          <div className="lg:col-span-4">
            <OrderTrackingCard order={order} />
          </div>

        </div>
      </Container>
    </section>
  );
};

/* --- Sub-Components --- */

const PriceDetailsCard = ({ order }) => {
  const item = order.items[0];
  const discount = item.price - order.totalAmount;

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-50">
        <h3 className="text-sm font-bold text-gray-900">Price Details</h3>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span>Price ({item.quantity} item)</span>
          <span className="font-bold">₹{item.price}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Discount</span>
          <span className="text-green-600 font-bold">-₹{discount}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span className="font-bold">₹0</span>
        </div>
      </div>

      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between">
          <span className="font-bold">Total Amount</span>
          <span className="font-extrabold">₹{order.totalAmount}</span>
        </div>
      </div>

      <div className="p-5 flex justify-between text-sm border-t border-gray-100">
        <span>Payment method</span>
        <span className="font-bold uppercase">{order.paymentMethod}</span>
      </div>
    </div>
  );
};


const RatingCard = () => (
    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-1">
            Rate Your Experience 🐾
        </h3>
        <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className="text-2xl text-yellow-400 cursor-pointer" />
            ))}
        </div>
        <button className="bg-[#94a3b8] hover:bg-[#64748b] text-white font-bold py-2.5 px-8 rounded-full text-sm transition">
            Submit
        </button>
    </div>
);

const ReturnOrderCard = () => (
    <button className="w-full bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm text-left flex justify-between items-center group transition">
        <span className="text-sm font-bold text-gray-900">Return Order ➔</span>
    </button>
);

const OrderTrackingCard = () => {
    const steps = [
        { title: "Order Placed", time: "22 Nov 2025, 10:45 AM", detail: "We've received your order.", active: true },
        { title: "Packed & Ready", time: "22 Nov 2025, 10:45 AM", detail: "Your pet's goodies are packed with care.", active: true },
        { title: "Shipped", time: "22 Nov 2025, 10:45 AM", detail: "Your order is on its way.", active: true },
        { title: "Out for Delivery", time: "22 Nov 2025, 10:45 AM", detail: "Your order is out for delivery - almost there!", active: true },
        { title: "Delivered", time: "22 Nov 2025, 10:45 AM", detail: "Delivered safely. Hope your pet loves it!", active: true },
    ];

    return (
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Placed, 22 Nov 2025</h3>
                    <p className="text-xs text-gray-500 font-medium">Your pet's goodies are almost home!</p>
                </div>
                <IoCheckmarkCircle className="text-2xl text-[#a3e635]" />
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-8">Order Update</h3>
            <div className="space-y-8 relative">
                {/* Timeline Connector Line */}
                <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gray-100" />

                {steps.map((step, idx) => (
                    <div key={idx} className="relative flex gap-4 pl-8">
                        <IoCheckmarkCircle className={`absolute left-0 text-[26px] z-10 bg-white rounded-full ${step.active ? 'text-[#a3e635]' : 'text-gray-200'}`} />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-gray-900 leading-none">{step.title}</h4>
                            <p className="text-[11px] font-bold text-gray-400">{step.time}</p>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{step.detail}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderDetails;