"use client"
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import LessonSidebar from '@/components/LessonSidebar';
import VideoPlayer from '@/components/VideoPlayer';
import { useTrainingVideos } from '@/hooks/useTrainingVideos';
import { usePetStore } from '@/store/petStore';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';
import Container from '@/components/Container';
import { markTrainingProgressComplete, fetchTrainingVideoById } from '@/lib/api';
import InstructorCard from '@/components/InstructorCard';

function videoToLesson(video, index = 0) {
  const duration = video.duration || 5;
  const durationText = typeof duration === 'number' ? `${duration} Min` : `${duration}`;
  return {
    id: video._id,
    _id: video._id,
    title: video.title || '(Video Title)',
    lessonNum: `${index + 1} Lesson`,
    time: `${index + 1} Day | ${durationText}`,
    duration,
    image: video.thumbnail || `/images/lessons/lesson${(index % 7) + 1}.png`,
    videoUrl: video.videoUrl,
    description: video.description || '',
    completed: false,
    isActive: video.isFree !== false,
    instructor: video.instructor
  };
}

const TrainingLessonPage = () => {
  const { plan, lessonID } = useParams();
  const petType = usePetStore((s) => s.petType || 'dog');
  const { programs, loading, progressByPlan, refetchProgress, error, refetch } = useTrainingVideos({ petType });

  const [lessonFromBackend, setLessonFromBackend] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(true);

  const currentPlan = programs.find((p) => p.program === plan);
  const lessonFromList = currentPlan?.sessions?.find(
    (l) => String(l.id) === String(lessonID) || String(l._id) === String(lessonID)
  );
  const currentLesson = lessonFromBackend ?? lessonFromList;

  useEffect(() => {
    if (!lessonID) {
      setLoadingLesson(false);
      return;
    }
    setLoadingLesson(true);
    fetchTrainingVideoById(lessonID)
      .then((video) => setLessonFromBackend(videoToLesson(video, 0)))
      .catch(() => setLessonFromBackend(null))
      .finally(() => setLoadingLesson(false));
  }, [lessonID]);

  const handleMarkComplete = async () => {
    const videoId = currentLesson?.id || currentLesson?._id;
    if (!videoId) return;
    try {
      await markTrainingProgressComplete({ videoId, category: plan || 'basic' });
      refetchProgress({ optimisticCompletedIds: [videoId] });
    } catch (_) {}
  };

  if (loading && !lessonFromBackend && !lessonFromList) return <Container><p className="py-12 text-gray-500">Loading...</p></Container>;
  
  if (error && !currentLesson) {
    return (
      <Container>
        <div className="py-12 px-6 rounded-xl bg-red-50 border border-red-200 text-center max-w-lg mx-auto">
          <p className="text-red-700 font-medium mb-2">Training data could not be loaded.</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button type="button" onClick={() => refetch()} className="px-6 py-2 bg-[#1F2E46] text-white font-semibold rounded-lg hover:opacity-90">Retry</button>
        </div>
      </Container>
    );
  }
  
  if (!currentLesson && !loadingLesson) return <div className="p-8 text-gray-600">Lesson not found</div>;
  if (loadingLesson && !lessonFromList && !lessonFromBackend) return <Container><p className="py-12 text-gray-500">Loading lesson...</p></Container>;

  const progress = progressByPlan[plan] ?? 0;
  const pageTitle = currentPlan?.title || (plan ? `${String(plan).charAt(0).toUpperCase() + String(plan).slice(1)} Training` : 'Basic Training');
  const sidebarLessons = currentPlan?.sessions ?? (currentLesson ? [currentLesson] : []);

  return (
    <>
      <Container>
        <div className="pt-10">
          <p className="text-sm text-gray-600 mb-2">Pet Training</p>
          <h1 className="text-3xl font-extrabold">{pageTitle}</h1>
        </div>
        
        <section className="flex flex-col lg:flex-row gap-8 mt-6">
          <div className="flex-1 min-w-0">
            <VideoPlayer lesson={currentLesson} onMarkComplete={handleMarkComplete} />
          </div>
          <div className="w-full lg:w-[380px] shrink-0">
            <LessonSidebar
              lessons={sidebarLessons}
              activeLessonId={currentLesson.id || currentLesson._id}
              plan={plan}
              progress={progress}
            />
          </div>
        </section>
        
        <InstructorCard instructor={currentLesson?.instructor} />
      </Container>
      <WhyChooseFurrmaa />
    </>
  );
};

export default TrainingLessonPage;