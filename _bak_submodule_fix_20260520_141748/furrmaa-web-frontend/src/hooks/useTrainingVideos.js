'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTrainingVideos, fetchTrainingProgress } from '@/lib/api';

function videoToLesson(video, index) {
  const duration = video.duration || 5;
  return {
    id: video._id,
    _id: video._id,
    title: video.title || '(Video Title)',
    lessonNum: `${index + 1} Lesson`,
    time: `${index + 1} Day | ${duration} min`,
    duration,
    image: video.thumbnail || `/images/lessons/lesson${(index % 7) + 1}.png`,
    videoUrl: video.videoUrl,
    description: video.description || 'This lesson covers the fundamentals of basic training and bonding.',
    completed: false,
    isActive: video.isFree !== false,
  };
}

function buildProgramsFromVideos(videos, petType = 'dog') {
  const defaultPrograms = [
    { program: 'basic', title: 'Basic Training', category: 'basic', isFree: true, image: '/images/CardTwo/p1.png', textColor: 'text-gray-900', order: 1 },
    { program: 'intermediate', title: 'Intermediate Training', category: 'intermediate', isFree: false, image: '/images/CardTwo/inter.png', textColor: 'text-white', order: 2 },
    { program: 'advanced', title: 'Advanced Training', category: 'advanced', isFree: false, image: '/images/CardTwo/adv.png', textColor: 'text-white', order: 3 },
  ];

  const programsMap = new Map();
  defaultPrograms.forEach((p) => {
    programsMap.set(p.program, {
      program: p.program,
      id: p.program,
      title: p.title,
      description: p.program === 'basic' ? 'Foundation skills, simple commands, bonding.' : p.program === 'intermediate' ? 'Discipline, behavior shaping, control.' : 'Master-level commands, agility, obedience.',
      color: p.program === 'basic' ? 'bg-[#FDE68A]' : p.program === 'intermediate' ? 'bg-[#E29587]' : 'bg-[#6366F1]',
      textColor: p.textColor,
      tags: [],
      isFree: p.isFree,
      image: p.image,
      sessions: [],
      order: p.order,
    });
  });

  videos.forEach((v) => {
    const petTypeArr = Array.isArray(v.petType) ? v.petType : [v.petType || 'both'];
    const matchesPet = !petType || petTypeArr.includes(petType) || petTypeArr.includes('both');
    if (!matchesPet) return;
    const cat = (v.category || 'basic').toLowerCase();
    const programKey = ['basic', 'intermediate', 'advanced'].includes(cat) ? cat : 'basic';
    const prog = programsMap.get(programKey);
    if (!prog) return;
    const lesson = videoToLesson(v, prog.sessions.length);
    lesson.isActive = v.isFree !== false;
    prog.sessions.push(lesson);
  });

  return Array.from(programsMap.values())
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((p) => {
      const count = p.sessions.length;
      const tags = [`${count} Lessons`, `${count} Days`, `${count} Great Ways to Training`];
      return { ...p, tags: p.tags.length ? p.tags : tags };
    });
}

function mergeProgress(programs, completedVideoIds) {
  const ids = new Set((completedVideoIds || []).map(String));
  const progressByPlan = {};
  const merged = programs.map((p) => {
    const sessions = (p.sessions || []).map((s) => ({
      ...s,
      completed: ids.has(String(s.id || s._id)),
    }));
    const freeSessions = sessions.filter((s) => s.isActive !== false);
    const completedFree = freeSessions.filter((s) => s.completed).length;
    const totalFree = freeSessions.length;
    progressByPlan[p.program] = totalFree ? Math.round((completedFree / totalFree) * 100) : 0;
    return { ...p, sessions };
  });
  return { merged, progressByPlan };
}

export function useTrainingVideos(options = {}) {
  const { petType, category } = options;
  const [programs, setPrograms] = useState([]);
  const [progressByPlan, setProgressByPlan] = useState({ basic: 0, intermediate: 0, advanced: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchTrainingVideos({ category, petType })
      .then((videos) => {
        const built = buildProgramsFromVideos(videos || [], petType);
        return fetchTrainingProgress()
          .then(({ completedVideoIds }) => {
            const { merged, progressByPlan: planProgress } = mergeProgress(built, completedVideoIds);
            setPrograms(merged);
            setProgressByPlan(planProgress);
          })
          .catch(() => {
            const { progressByPlan: planProgress } = mergeProgress(built, []);
            setPrograms(built);
            setProgressByPlan(planProgress);
          });
      })
      .catch((err) => {
        setPrograms([]);
        setProgressByPlan({ basic: 0, intermediate: 0, advanced: 0 });
        setError(err?.message || 'Could not load training. Check if backend is running and try again.');
      })
      .finally(() => setLoading(false));
  }, [petType, category]);

  useEffect(() => {
    load();
  }, [load]);

  const refetchProgress = useCallback((opts = {}) => {
    const { optimisticCompletedIds = [] } = opts;
    if (optimisticCompletedIds.length > 0) {
      setPrograms((prev) => {
        if (prev.length === 0) return prev;
        const existingIds = prev.flatMap((p) =>
          (p.sessions || []).filter((s) => s.completed).map((s) => String(s.id || s._id))
        );
        const allIds = [...new Set([...existingIds, ...optimisticCompletedIds.map(String)])];
        const { merged, progressByPlan: planProgress } = mergeProgress(prev, allIds);
        setProgressByPlan(planProgress);
        return merged;
      });
    }
    fetchTrainingProgress()
      .then(({ completedVideoIds }) => {
        setPrograms((prev) => {
          if (prev.length === 0) return prev;
          const { merged, progressByPlan: planProgress } = mergeProgress(prev, completedVideoIds);
          setProgressByPlan(planProgress);
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  return { programs, loading, progressByPlan, refetchProgress, error, refetch: load };
}
