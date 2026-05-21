"use client";

import { FaPlay } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const LessonCard = ({ lesson, plan }) => {
  const router = useRouter();

  const handleClick = () => {
    if (lesson.isActive) {
      router.push(`/training/${plan}/${lesson.id}`);
    } else {
      router.push('/training/subscribe');
    }
  };

  return (
    <div className="bg-white border border-[#dadce1] hover:border-[#abeb87] rounded-[24px] shadow-sm overflow-hidden">
      <img src={lesson.image} className="w-full h-28 object-cover" />

      <div className="p-4 space-y-2">
        <h4 className="text-[12px] font-extrabold text-black">
          {lesson.title}
        </h4>

        <div className="text-[10px] text-gray-400 font-bold uppercase">
          <p>{lesson.lessonNum}</p>
          <p>{lesson.time}</p>
        </div>

        <button
          onClick={handleClick}
          className={`w-full py-2.5 rounded-full flex items-center justify-center gap-2 text-[10px] font-bold
          ${
            lesson.isActive
              ? 'bg-[#1F2E46] text-white'
              : 'bg-[#8E939A] text-white'
          }`}
        >
          <FaPlay className="text-[8px]" />
          {lesson.isActive ? 'Play' : 'Unlock'}
        </button>
      </div>
    </div>
  );
};

export default LessonCard;
