import { useRef } from 'react';

const VideoPlayer = ({ lesson, onMarkComplete }) => {
  const hasAutoMarked = useRef(false);

  const handlePlay = () => {
    if (onMarkComplete && !hasAutoMarked.current) {
      hasAutoMarked.current = true;
      onMarkComplete();
    }
  };

  return (
    <div>
      {/* VIDEO CONTAINER - Forced Landscape with Portrait Fit */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-sm">
        <video
          src={lesson.videoUrl}
          controls
          autoPlay
          className="w-full h-full object-contain"
          onPlay={handlePlay}
          poster={lesson.image}
        />
      </div>

      {/* TITLE */}
      <h2 className="text-3xl font-extrabold mt-8 text-gray-900">
        {lesson.title}
      </h2>

      {/* META */}
      <p className="text-sm text-gray-600 mt-2 font-medium">
        {lesson.lessonNum} | {lesson.time}
      </p>

      {/* DIVIDER */}
      <hr className="border-gray-100 my-6" />

      {/* DESCRIPTION TITLE */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Video Description
      </h3>

      {/* DESCRIPTION CONTENT */}
      <div className="text-sm leading-relaxed text-gray-600 space-y-4">
        {lesson.description ? (
          <p>{lesson.description}</p>
        ) : (
          <>
            <p>
              Lorem ipsum dolor sit amet consectetur. At nisl et eu elementum
              maecenas turpis odio. Sem eu diam ornare nunc. Pulvinar placerat sed potenti
              purus amet eleifend ornare. Malesuada tristique sit aliquam urna.
            </p>
            <p>
              Vitae pulvinar purus velit id laoreet fermentum lectus elit volutpat. Sem turpis sapien porta viverra integer at. Vitae facilisis consectetur
              maecenas ac scelerisque egestas viverra posuere vitae.
            </p>
            <p>
              Nunc sed tristique placerat hendrerit at viverra eget augue nec. Hendrerit eget volutpat in posuere at. Amet sagittis quam quisque porttitor. Elit
              porttitor cursus sed fringilla.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;