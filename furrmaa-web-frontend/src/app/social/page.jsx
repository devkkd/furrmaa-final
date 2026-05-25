'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '@/components/Container';
import {
  fetchSocialPosts,
  createSocialPost,
  toggleSocialLike,
  fetchSocialComments,
  addSocialComment,
  uploadImage,
  getToken,
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';

export default function SocialPage() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?._id || user?.id;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [imageUrls, setImageUrls] = useState([]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchSocialPosts();
      setPosts(list);
    } catch (e) {
      setError(e.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const isLiked = (post) => {
    if (!userId || !post.likes?.length) return false;
    return post.likes.some((l) => String(l?._id || l) === String(userId));
  };

  const handleLike = async (postId) => {
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    try {
      const updated = await toggleSocialLike(postId);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: updated?.likes ?? p.likes } : p))
      );
    } catch (e) {
      setError(e.message || 'Could not update like');
    }
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    try {
      const url = await uploadImage(file, 'furmaa/social');
      setImageUrls((prev) => [...prev, url]);
    } catch (err) {
      setError(err.message || 'Image upload failed');
    }
    e.target.value = '';
  };

  const handleCreatePost = async () => {
    if (!content.trim() && imageUrls.length === 0) {
      setError('Write something or add a photo');
      return;
    }
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    setPosting(true);
    setError('');
    try {
      await createSocialPost({
        content: content.trim() || 'Shared a moment 🐾',
        images: imageUrls,
        videos: [],
      });
      setContent('');
      setImageUrls([]);
      setComposeOpen(false);
      await loadPosts();
    } catch (e) {
      setError(e.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const openComments = async (postId) => {
    setCommentPostId(postId);
    setCommentText('');
    try {
      const list = await fetchSocialComments(postId);
      setComments(list);
    } catch {
      setComments([]);
    }
  };

  const submitComment = async () => {
    if (!commentPostId || !commentText.trim()) return;
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    try {
      await addSocialComment(commentPostId, commentText.trim());
      const list = await fetchSocialComments(commentPostId);
      setComments(list);
      setCommentText('');
      await loadPosts();
    } catch (e) {
      setError(e.message || 'Comment failed');
    }
  };

  return (
    <section className="bg-gray-50 py-8 md:py-12 min-h-screen">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pet Social</h1>
              <p className="text-gray-500 text-sm mt-1">Share moments with the Furrmaa community</p>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                className="bg-[#1F2E46] hover:bg-[#152033] transition-colors text-white font-semibold px-6 py-2.5 rounded-full text-sm shadow-md active:scale-95"
              >
                Create Post
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-[#1F2E46] hover:bg-[#152033] transition-colors text-white font-semibold px-6 py-2.5 rounded-full text-sm shadow-md active:scale-95"
              >
                Login to Post
              </Link>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Feed Content */}
          {loading ? (
            /* Loading Skeleton */
            <div className="space-y-6">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded-md w-32"></div>
                      <div className="h-3 bg-gray-100 rounded-md w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-xl w-full mb-4"></div>
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                    <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm mt-8">
              <div className="text-gray-300 mb-4 flex justify-center">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No posts yet.</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to share a moment!</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {posts.map((post) => (
                <li
                  key={post._id}
                  className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={post.user?.profileImage || 'https://placehold.co/40x40/e5e7eb/6b7280?text=U'}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover bg-gray-100 ring-2 ring-gray-50"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{post.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric'
                        }) : ''}
                      </p>
                    </div>
                  </div>
                  
                  {post.content && (
                    <p className="text-gray-800 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                  )}
                  
                  {post.images?.length > 0 && (
                    <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {post.images.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="rounded-xl w-full h-auto max-h-[400px] object-cover border border-gray-100"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isLiked(post) ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      {isLiked(post) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                      {post.likes?.length || 0}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => openComments(post._id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
                    >
                      <FaComment className="text-gray-400" />
                      {post.comments?.length ?? 0}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

      {/* Compose Post Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setComposeOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl transform transition-all animate-in fade-in zoom-in-95 sm:slide-in-from-bottom-0 slide-in-from-bottom-10">
            <h3 className="text-xl font-extrabold text-gray-900 mb-4">Create New Post</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="What's on your pet's mind?"
              className="w-full border border-gray-200 rounded-xl p-4 text-sm mb-4 outline-none resize-none focus:border-[#1F2E46] focus:ring-2 focus:ring-[#1F2E46]/20 transition-all bg-gray-50 focus:bg-white"
            />
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <label className="inline-flex items-center gap-2 text-sm text-[#1F2E46] font-semibold cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl font-semibold transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={posting}
                onClick={handleCreatePost}
                className="flex-1 bg-[#1F2E46] hover:bg-[#152033] text-white py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {commentPostId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setCommentPostId(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[85vh] flex flex-col transform transition-all animate-in fade-in zoom-in-95 sm:slide-in-from-bottom-0 slide-in-from-bottom-10">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-gray-900">Comments</h3>
              <button onClick={() => setCommentPostId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <ul className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px] pr-2 custom-scrollbar">
              {comments.length === 0 ? (
                <li className="text-gray-500 text-sm text-center py-8">No comments yet. Start the conversation!</li>
              ) : (
                comments.map((c) => (
                  <li key={c._id} className="text-sm">
                    <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none inline-block max-w-[90%]">
                      <span className="font-bold text-gray-900 block mb-1">{c.user?.name || 'User'}</span>
                      <span className="text-gray-700 leading-relaxed">{c.text}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
            
            {getToken() && (
              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1F2E46] focus:ring-2 focus:ring-[#1F2E46]/20 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                />
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={!commentText.trim()}
                  className="bg-[#1F2E46] hover:bg-[#152033] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}