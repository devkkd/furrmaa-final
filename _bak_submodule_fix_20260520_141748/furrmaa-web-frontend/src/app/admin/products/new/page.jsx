'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  adminGetCategories,
  adminGetSizes,
  adminGetDietary,
  adminCreateProduct,
  adminCreateCategory,
  adminCreateSize,
  adminCreateDietary,
  adminUploadImage,
} from '@/lib/api';
import { AdminImage } from '../../components/AdminImage';

const PET_TYPES = ['dog', 'cat', 'both'];
const AGE_OPTIONS = ['all', 'puppy', 'young', 'adult', 'senior'];

export default function AdminProductNewPage() {
  const router = useRouter();
  const singleInputRef = useRef(null);
  const multiInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [dietary, setDietary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    petType: ['both'],
    age: 'all',
    size: '',
    dietaryNeeds: [],
    price: '',
    discountPrice: '',
    stock: '0',
    brand: '',
    images: [],
    isActive: true,
  });
  const categoryPhotoRef = useRef(null);
  const [modal, setModal] = useState(null);
  const [modalValue, setModalValue] = useState('');
  const [modalImage, setModalImage] = useState('');
  const [modalUploading, setModalUploading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  const fetchOptions = () => {
    Promise.all([
      adminGetCategories(),
      adminGetSizes(),
      adminGetDietary(),
    ]).then(([cats, sz, diet]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setSizes(Array.isArray(sz) ? sz : []);
      setDietary(Array.isArray(diet) ? diet : []);
      if (Array.isArray(cats) && cats.length > 0 && !form.category) {
        setForm((f) => ({ ...f, category: cats[0].slug || cats[0].name?.toLowerCase?.() || '' }));
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name?.trim() || !form.description?.trim() || form.price === '' || form.price == null) {
      setError('Name, description and price are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category || (categories[0]?.slug),
        petType: Array.isArray(form.petType) ? form.petType : [form.petType || 'both'],
        age: form.age || 'all',
        size: form.size || undefined,
        dietaryNeeds: Array.isArray(form.dietaryNeeds) ? form.dietaryNeeds : [],
        price: Number(form.price) || 0,
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        stock: Number(form.stock) || 0,
        brand: form.brand?.trim() || undefined,
        images: Array.isArray(form.images) ? form.images : [],
        isActive: !!form.isActive,
      };
      await adminCreateProduct(payload);
      router.push('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const togglePetType = (t) => {
    setForm((f) => {
      const arr = Array.isArray(f.petType) ? [...f.petType] : [f.petType || 'both'];
      const i = arr.indexOf(t);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(t);
      return { ...f, petType: arr.length ? arr : ['both'] };
    });
  };

  const toggleDietary = (d) => {
    const slug = d.slug || d.name?.toLowerCase?.() || d;
    setForm((f) => {
      const arr = [...(f.dietaryNeeds || [])];
      const i = arr.indexOf(slug);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(slug);
      return { ...f, dietaryNeeds: arr };
    });
  };

  const handleCategoryPhotoUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setModalUploading(true);
    try {
      const { url } = await adminUploadImage(file, 'furmaa/categories');
      setModalImage(url);
    } catch (err) {
      alert(err.message || 'Upload failed. You can paste image URL below.');
    } finally {
      setModalUploading(false);
      if (categoryPhotoRef.current) categoryPhotoRef.current.value = '';
    }
  };

  const handleModalAdd = async () => {
    const name = (modalValue || '').trim();
    if (!name) return;
    setModalSaving(true);
    try {
      if (modal === 'category') {
        const imageUrl = (modalImage || '').trim();
        const res = await adminCreateCategory({ name, image: imageUrl });
        const newCat = res?.category;
        if (newCat) {
          const withImage = { ...newCat, image: newCat.image || imageUrl };
          setCategories((prev) => [...prev, withImage]);
          setForm((f) => ({ ...f, category: newCat.slug || newCat.name?.toLowerCase?.() }));
          setModalImage('');
        }
      } else if (modal === 'size') {
        const res = await adminCreateSize({ name });
        const newSize = res.size;
        if (newSize) {
          setSizes((prev) => [...prev, newSize]);
          setForm((f) => ({ ...f, size: newSize.slug || newSize.name?.toLowerCase?.() }));
        }
      } else if (modal === 'dietary') {
        const res = await adminCreateDietary({ name });
        const newD = res.dietary;
        if (newD) {
          setDietary((prev) => [...prev, newD]);
          const slug = newD.slug || newD.name?.toLowerCase?.();
          setForm((f) => ({ ...f, dietaryNeeds: [...(f.dietaryNeeds || []), slug] }));
        }
      }
      setModal(null);
      setModalValue('');
      setModalImage('');
    } catch (err) {
      alert(err.message || 'Failed to add');
    } finally {
      setModalSaving(false);
    }
  };

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const { url } = await adminUploadImage(files[i]);
        setForm((f) => ({ ...f, images: [...(f.images || []), url] }));
      }
    } catch (err) {
      alert(err.message || 'Upload failed. You can add image URLs below instead.');
    } finally {
      setUploading(false);
      if (singleInputRef.current) singleInputRef.current.value = '';
      if (multiInputRef.current) multiInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: (f.images || []).filter((_, i) => i !== index) }));
  };

  const slug = (c) => c.slug || c.name?.toLowerCase?.();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-[#1F2E46] font-medium hover:underline">← Products</Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Product name" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="Description" required />
        </div>

        {/* Category – cards with photo (jo photo diya hai wahi dikhe) + Add category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setForm({ ...form, category: slug(c) })}
                className={`w-24 text-center rounded-xl overflow-hidden border-2 transition ${form.category === slug(c) ? 'border-[#1F2E46] ring-2 ring-[#1F2E46]/20' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <AdminImage src={c.image} alt={c.name || ''} className="w-full h-full object-cover" />
                </div>
                <p className="py-1.5 text-xs font-medium text-gray-900 truncate px-1">{c.name}</p>
              </button>
            ))}
            <button type="button" onClick={() => { setModal('category'); setModalValue(''); setModalImage(''); }} className="w-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center aspect-square bg-gray-50 hover:border-[#1F2E46] hover:bg-gray-100 text-gray-500">
              <span className="text-2xl mb-1">+</span>
              <span className="text-xs font-medium">Add category</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pet type</label>
          <div className="flex gap-2 flex-wrap">
            {PET_TYPES.map((t) => (
              <label key={t} className="inline-flex items-center gap-1">
                <input type="checkbox" checked={(form.petType || []).includes(t)} onChange={() => togglePetType(t)} />
                <span className="text-sm">{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <select value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {AGE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Size – same as app: dropdown + Add size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <div className="flex flex-wrap gap-2 items-center">
            <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
              <option value="">–</option>
              {sizes.map((s) => <option key={s._id} value={slug(s)}>{s.name}</option>)}
            </select>
            <button type="button" onClick={() => { setModal('size'); setModalValue(''); }} className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#1F2E46]">
              + Add size
            </button>
          </div>
        </div>

        {/* Dietary – same as app: checkboxes + Add dietary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dietary</label>
          <div className="flex flex-wrap gap-2">
            {dietary.map((d) => (
              <label key={d._id} className="inline-flex items-center gap-1">
                <input type="checkbox" checked={(form.dietaryNeeds || []).includes(slug(d))} onChange={() => toggleDietary(d)} />
                <span className="text-sm">{d.name}</span>
              </label>
            ))}
            <button type="button" onClick={() => { setModal('dietary'); setModalValue(''); }} className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#1F2E46]">
              + Add dietary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount price (₹)</label>
            <input type="number" min="0" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        {/* Product Images – same as app: Upload + URL + thumbnails */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
          <div className="flex flex-wrap gap-2 mb-2">
            <input ref={singleInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
            <input ref={multiInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
            <button type="button" onClick={() => singleInputRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
              📷 Upload Single Image
            </button>
            <button type="button" onClick={() => multiInputRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
              📸 Upload Multiple Images
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-1">Or add image URLs (one per line or comma-separated):</p>
          <div className="flex gap-2">
            <textarea
              id="imageUrls"
              placeholder="Paste URLs here..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[60px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const ta = e.target;
                  const arr = ta.value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
                  if (arr.length) {
                    setForm((f) => ({ ...f, images: [...(f.images || []), ...arr] }));
                    ta.value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const ta = document.getElementById('imageUrls');
                if (!ta) return;
                const arr = ta.value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
                if (arr.length) {
                  setForm((f) => ({ ...f, images: [...(f.images || []), ...arr] }));
                  ta.value = '';
                }
              }}
              className="self-end px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200"
            >
              Add URLs
            </button>
          </div>
          {(form.images || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(form.images || []).map((url, i) => (
                <div key={i} className="relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border">
                    <AdminImage src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm leading-none flex items-center justify-center opacity-90 group-hover:opacity-100">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-70">
            {loading ? 'Saving…' : 'Create Product'}
          </button>
          <Link href="/admin/products" className="bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-300">Cancel</Link>
        </div>
      </form>

      {/* Modals – Add category (with photo) / size / dietary */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !modalSaving && setModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">
              {modal === 'category' && 'Add new category'}
              {modal === 'size' && 'Add new size'}
              {modal === 'dietary' && 'Add new dietary option'}
            </h3>
            {modal === 'category' && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Category photo (optional)</p>
                <input ref={categoryPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleCategoryPhotoUpload} />
                <button type="button" onClick={() => categoryPhotoRef.current?.click()} disabled={modalUploading} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden hover:border-[#1F2E46] mb-2">
                  {modalImage ? <AdminImage src={modalImage} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-500 text-xs">{modalUploading ? '…' : '+ Photo'}</span>}
                </button>
                <input type="url" value={modalImage} onChange={(e) => setModalImage(e.target.value)} placeholder="Or paste image URL" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
              </div>
            )}
            <input
              type="text"
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              placeholder={modal === 'category' ? 'e.g. Dog Food, Treats' : modal === 'size' ? 'e.g. Extra Small, XXL' : 'e.g. Vegan, Senior Formula'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
              autoFocus={modal !== 'category'}
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleModalAdd} disabled={modalSaving || !modalValue.trim()} className="flex-1 bg-[#1F2E46] text-white font-medium py-2 rounded-lg disabled:opacity-50">
                {modalSaving ? 'Adding…' : 'Add'}
              </button>
              <button type="button" onClick={() => { setModal(null); setModalImage(''); }} disabled={modalSaving} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
