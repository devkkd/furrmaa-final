const InstructorCard = ({ instructor }) => {
  if (!instructor) return null;

  return (
    <div className="border-t mt-12 pt-8">
      <h2 className="text-xl font-bold mb-4">Trainer</h2>

      <div className="flex gap-6 items-start">
        <img
          src={instructor.image}
          alt={instructor.name}
          className="w-24 h-24 rounded-xl object-cover"
        />

        <div>
          <h3 className="font-bold text-lg">{instructor.name}</h3>

          <p className="text-gray-500 text-sm mb-2">
            {instructor.title} • {instructor.experience}+ Years
          </p>

          <p className="text-gray-600 text-sm max-w-xl">
            {instructor.bio}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;