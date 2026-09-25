'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTrainingVideos, fetchTrainingProgress } from '@/lib/api';

function videoToLesson(video, index, petType = 'dog') {
  const duration = video.duration || 5;
  const fallbackImg =
    petType === 'cat'
      ? `/images/cat-${(index % 2) + 1}.png`
      : `/images/dog-${(index % 4) + 1}.png`;
  return {
    id: video._id,
    _id: video._id,
    title: video.title || '(Video Title)',
    lessonNum: `${index + 1} Lesson`,
    time: `${index + 1} Day | ${duration} min`,
    duration,
    image: video.thumbnail || fallbackImg,
    videoUrl: video.videoUrl,
    description:
      video.description ||
      (petType === 'cat'
        ? 'This lesson covers gentle cat training and bonding basics.'
        : 'This lesson covers the fundamentals of basic training and bonding.'),
    completed: false,
    isActive: video.isFree !== false,
  };
}

function programDefaults(petType = 'dog') {
  const isCat = petType === 'cat';
  return [
    {
      program: 'basic',
      title: isCat ? 'Basic Cat Training' : 'Basic Dog Training',
      description: isCat
        ? 'Litter habits, calm cues, and bonding for cats & kittens.'
        : 'Foundation skills, simple commands, and bonding for dogs & puppies.',
      isFree: true,
      image: isCat ? '/images/cat-1.1.png' : '/images/td.png',
      textColor: 'text-gray-900',
      order: 1,
      tags: isCat ? ['Kitten', 'Cat'] : ['Puppy', 'Dog'],
    },
    {
      program: 'intermediate',
      title: isCat ? 'Intermediate Cat Training' : 'Intermediate Dog Training',
      description: isCat
        ? 'Scratching, enrichment, and behavior shaping for cats.'
        : 'Discipline, behavior shaping, and everyday control for dogs.',
      isFree: false,
      image: isCat ? '/images/cat-1.2.png' : '/images/td3.png',
      textColor: 'text-white',
      order: 2,
      tags: isCat ? ['Cat', 'Habits'] : ['Dog', 'Obedience'],
    },
    {
      program: 'advanced',
      title: isCat ? 'Advanced Cat Training' : 'Advanced Dog Training',
      description: isCat
        ? 'Advanced enrichment, clicker work, and confident routines.'
        : 'Master-level commands, agility, and obedience.',
      isFree: false,
      image: isCat ? '/images/tc1.png' : '/images/td4.png',
      textColor: 'text-white',
      order: 3,
      tags: isCat ? ['Cat', 'Advanced'] : ['Dog', 'Advanced'],
    },
  ];
}

function buildProgramsFromVideos(videos, petType = 'dog') {
  const defaultPrograms = programDefaults(petType);
  const programsMap = new Map();

  defaultPrograms.forEach((p) => {
    programsMap.set(p.program, {
      program: p.program,
      id: p.program,
      title: p.title,
      description: p.description,
      color:
        p.program === 'basic'
          ? 'bg-[#FDE68A]'
          : p.program === 'intermediate'
            ? 'bg-[#E29587]'
            : 'bg-[#6366F1]',
      textColor: p.textColor,
      tags: [...p.tags],
      isFree: p.isFree,
      image: p.image,
      sessions: [],
      order: p.order,
      petType,
    });
  });

  videos.forEach((v) => {
    const petTypeArr = Array.isArray(v.petType) ? v.petType : [v.petType || 'both'];
    const matchesPet =
      !petType || petTypeArr.includes(petType) || petTypeArr.includes('both');
    if (!matchesPet) return;
    const cat = (v.category || 'basic').toLowerCase();
    const programKey = ['basic', 'intermediate', 'advanced'].includes(cat)
      ? cat
      : 'basic';
    const prog = programsMap.get(programKey);
    if (!prog) return;
    const lesson = videoToLesson(v, prog.sessions.length, petType);
    lesson.isActive = v.isFree !== false;
    prog.sessions.push(lesson);
  });

  return Array.from(programsMap.values())
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((p) => {
      const count = p.sessions.length;
      const countTags =
        count > 0
          ? [`${count} Lessons`, `${count} Days`]
          : [];
      return {
        ...p,
        tags: [...p.tags, ...countTags, 'View More Details'],
      };
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
    progressByPlan[p.program] = totalFree
      ? Math.round((completedFree / totalFree) * 100)
      : 0;
    return { ...p, sessions };
  });
  return { merged, progressByPlan };
}

export function useTrainingVideos(options = {}) {
  const { petType, category } = options;
  const [programs, setPrograms] = useState([]);
  const [progressByPlan, setProgressByPlan] = useState({
    basic: 0,
    intermediate: 0,
    advanced: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchTrainingVideos({ category, petType })
      .then((videos) => {
        const built = buildProgramsFromVideos(videos || [], petType || 'dog');
        return fetchTrainingProgress()
          .then(({ completedVideoIds }) => {
            const { merged, progressByPlan: planProgress } = mergeProgress(
              built,
              completedVideoIds
            );
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
        setError(
          err?.message ||
            'Could not load training. Check if backend is running and try again.'
        );
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
          (p.sessions || [])
            .filter((s) => s.completed)
            .map((s) => String(s.id || s._id))
        );
        const allIds = [
          ...new Set([...existingIds, ...optimisticCompletedIds.map(String)]),
        ];
        const { merged, progressByPlan: planProgress } = mergeProgress(
          prev,
          allIds
        );
        setProgressByPlan(planProgress);
        return merged;
      });
    }
    fetchTrainingProgress()
      .then(({ completedVideoIds }) => {
        setPrograms((prev) => {
          if (prev.length === 0) return prev;
          const { merged, progressByPlan: planProgress } = mergeProgress(
            prev,
            completedVideoIds
          );
          setProgressByPlan(planProgress);
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  return { programs, loading, progressByPlan, refetchProgress, error, refetch: load };
}
