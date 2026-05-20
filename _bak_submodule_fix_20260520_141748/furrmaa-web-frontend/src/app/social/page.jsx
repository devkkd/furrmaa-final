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
    <section className="bg-white py-8 md:py-12 min-h-screen">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Pet Social</h1>
              <p className="text-gray-600 text-sm mt-1">Share moments with the Furrmaa community</p>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                className="bg-[#1F2E46] text-white font-semibold px-5 py-2.5 rounded-full text-sm"
              >
                Create post
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-[#1F2E46] text-white font-semibold px-5 py-2.5 rounded-full text-sm"
              >
                Login to post
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-center py-12">Loading feed…</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No posts yet. Be the first to share!</p>
          ) : (
            <ul className="space-y-6">
              {posts.map((post) => (
                <li
                  key={post._id}
                  className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.user?.profileImage || 'https://placehold.co/40x40/e5e7eb/6b7280?text=U'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{post.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  {post.content && (
                    <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                  )}
                  {post.images?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {post.images.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="rounded-xl w-full max-h-64 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-6 pt-2 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500"
                    >
                      {isLiked(post) ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                      {post.likes?.length || 0}
                    </button>
                    <button
                      type="button"
                      onClick={() => openComments(post._id)}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <FaComment />
                      {post.comments?.length ?? 0}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setComposeOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">New post</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="What's on your pet's mind?"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 outline-none focus:border-[#1F2E46]"
            />
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {imageUrls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}
            <label className="inline-block mb-4 text-sm text-[#1F2E46] font-medium cursor-pointer">
              Add photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={posting}
                onClick={handleCreatePost}
                className="flex-1 bg-[#1F2E46] text-white py-2.5 rounded-lg font-bold disabled:opacity-50"
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {commentPostId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCommentPostId(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold mb-4">Comments</h3>
            <ul className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[120px]">
              {comments.length === 0 ? (
                <li className="text-gray-500 text-sm">No comments yet</li>
              ) : (
                comments.map((c) => (
                  <li key={c._id} className="text-sm border-b border-gray-50 pb-2">
                    <span className="font-semibold">{c.user?.name || 'User'}: </span>
                    {c.text}
                  </li>
                ))
              )}
            </ul>
            {getToken() && (
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  className="bg-[#1F2E46] text-white px-4 py-2 rounded-lg text-sm font-semibold"
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
