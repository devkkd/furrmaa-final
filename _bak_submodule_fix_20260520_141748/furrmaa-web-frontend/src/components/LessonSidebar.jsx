"use client"
import { useRouter } from 'next/navigation';

const LessonSidebar = ({ lessons, activeLessonId, plan, progress = 0 }) => {
  const router = useRouter();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-xl font-extrabold mb-5 text-gray-900">Lessons</h3>

      {/* PROGRESS BAR - Matches the green box UI */}
      <div className="bg-[#9EEA63] rounded-xl p-3 mb-6 flex items-center gap-3">
        <span className="text-[13px] font-semibold text-gray-900 whitespace-nowrap px-1">
          Learning Progress
        </span>
        <div className="relative flex-1 h-1.5 bg-black/10 rounded-full flex items-center">
          {/* Thumb Indicator */}
          <div 
            className="w-3 h-3 bg-white rounded-full absolute shadow-sm" 
            style={{ 
              left: `${Math.min(100, Math.max(0, progress))}%`, 
              transform: 'translateX(-50%)' 
            }} 
          />
        </div>
        <span className="text-[13px] font-semibold text-gray-900 px-1">
          {progress}%
        </span>
      </div>

      {/* LESSON LIST */}
      <div className="space-y-3">
        {lessons.map((lesson) => {
          const lessonId = lesson.id ?? lesson._id;
          const isActive = String(activeLessonId) === String(lessonId);
          
          return (
            <div
              key={lessonId}
              onClick={() => router.push(`/training/${plan}/${lessonId}`)}
              className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-colors duration-200
                ${isActive 
                  ? 'border-[#9EEA63] bg-white' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
            >
              <img
                src={lesson.image}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
                alt={lesson.title}
              />
              
              <div className="flex-1 min-w-0 py-1">
                <p className="font-bold text-[14px] text-gray-900 truncate">
                  {lesson.title}
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {lesson.lessonNum} | {lesson.time}
                </p>
              </div>

              <div className="w-7 h-7 rounded-full bg-[#1F2E46] text-white flex items-center justify-center shrink-0 mr-1">
                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonSidebar;