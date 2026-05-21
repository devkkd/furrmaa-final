'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminGetOrderById, adminUpdateOrderStatus, adminUpdateOrderShipping, adminSyncOrderZohoShipping } from '@/lib/api';
import { AdminImage } from '../../components/AdminImage';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [shippingForm, setShippingForm] = useState({
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    status: '',
    estimatedDelivery: '',
  });
  const [shippingSaving, setShippingSaving] = useState(false);
  const [zohoSyncing, setZohoSyncing] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminGetOrderById(id)
      .then((o) => {
        setOrder(o);
        setNewStatus(o.orderStatus || 'pending');
        setShippingForm({
          carrier: o.shippingDetails?.carrier || '',
          trackingNumber: o.shippingDetails?.trackingNumber || o.trackingNumber || '',
          trackingUrl: o.shippingDetails?.trackingUrl || '',
          status: o.shippingDetails?.status || '',
          estimatedDelivery: o.shippingDetails?.estimatedDelivery ? new Date(o.shippingDetails.estimatedDelivery).toISOString().slice(0, 10) : '',
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id || !newStatus) return;
    setUpdating(true);
    try {
      const updated = await adminUpdateOrderStatus(id, { orderStatus: newStatus });
      setOrder(updated.order || order);
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveShipping = async () => {
    if (!id) return;
    setShippingSaving(true);
    try {
      const updated = await adminUpdateOrderShipping(id, shippingForm);
      setOrder(updated.order || order);
      alert('Shipping details updated');
    } catch (e) {
      alert(e.message);
    } finally {
      setShippingSaving(false);
    }
  };

  const handleZohoSync = async () => {
    if (!id) return;
    setZohoSyncing(true);
    try {
      const updated = await adminSyncOrderZohoShipping(id);
      const nextOrder = updated.order || order;
      setOrder(nextOrder);
      setShippingForm((prev) => ({
        ...prev,
        trackingNumber: nextOrder.shippingDetails?.trackingNumber || prev.trackingNumber,
        trackingUrl: nextOrder.shippingDetails?.trackingUrl || prev.trackingUrl,
        status: nextOrder.shippingDetails?.status || prev.status,
      }));
      alert(nextOrder.zohoShipping?.syncStatus === 'success' ? 'Zoho sync completed' : `Zoho sync failed: ${nextOrder.zohoShipping?.syncError || 'Unknown error'}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setZohoSyncing(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading order...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!order) return <p className="text-gray-500">Order not found.</p>;

  const addr = order.shippingAddress || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-[#1F2E46] font-medium hover:underline">← Orders</Link>
        <h1 className="text-2xl font-bold text-gray-900">Order {order._id?.slice(-8)}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Status</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-70"
            >
              {updating ? 'Updating…' : 'Update Status'}
            </button>
          </div>
          <p className="text-sm text-gray-500">Amount: ₹{(order.totalAmount ?? 0).toLocaleString('en-IN')} | Payment: {order.paymentMethod} | {order.paymentStatus}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-2">Shipping Address</h2>
          <p className="text-sm text-gray-600">
            {addr.street}, {addr.city}, {addr.state} {addr.zipCode}<br />
            {addr.phone && `Phone: ${addr.phone}`}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900">Shipping Details (Zoho Inventory)</h2>
          <button
            onClick={handleZohoSync}
            disabled={zohoSyncing}
            className="border border-[#1F2E46] text-[#1F2E46] text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-70"
          >
            {zohoSyncing ? 'Syncing…' : 'Sync from Zoho'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Carrier (e.g. Delhivery)"
            value={shippingForm.carrier}
            onChange={(e) => setShippingForm((s) => ({ ...s, carrier: e.target.value }))}
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Tracking number"
            value={shippingForm.trackingNumber}
            onChange={(e) => setShippingForm((s) => ({ ...s, trackingNumber: e.target.value }))}
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Tracking URL"
            value={shippingForm.trackingUrl}
            onChange={(e) => setShippingForm((s) => ({ ...s, trackingUrl: e.target.value }))}
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Shipping status"
            value={shippingForm.status}
            onChange={(e) => setShippingForm((s) => ({ ...s, status: e.target.value }))}
          />
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={shippingForm.estimatedDelivery}
            onChange={(e) => setShippingForm((s) => ({ ...s, estimatedDelivery: e.target.value }))}
          />
        </div>

        <button
          onClick={handleSaveShipping}
          disabled={shippingSaving}
          className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-70"
        >
          {shippingSaving ? 'Saving…' : 'Save Shipping Details'}
        </button>

        <div className="text-xs text-gray-600 space-y-1">
          <p>Zoho Sales Order: {order.zohoShipping?.salesOrderNumber || order.zohoShipping?.salesOrderId || 'Not synced'}</p>
          <p>Zoho Sync Status: {order.zohoShipping?.syncStatus || 'pending'}</p>
          {!!order.zohoShipping?.syncError && <p className="text-red-600">Sync Error: {order.zohoShipping.syncError}</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-bold text-gray-900 mb-4">Order Items ({order.items?.length ?? 0})</h2>
        <ul className="space-y-4">
          {(order.items || []).map((item, i) => {
            const img = item.product?.images?.[0] || item.product?.image;
            const name = item.product?.name || (typeof item.product === 'string' ? item.product : 'Product');
            return (
              <li key={i} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  {img ? (
                    <AdminImage src={img} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{(item.price ?? 0).toLocaleString('en-IN')}</p>
                </div>
                <p className="font-semibold text-gray-900 shrink-0">₹{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-IN')}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
