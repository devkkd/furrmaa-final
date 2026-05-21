export const trainingPrograms = [
    {
        program: 'basic',
        title: "Basic Training",
        description: "Foundation skills, simple commands, bonding.",
        color: "bg-[#FDE68A]",
        textColor: "text-gray-900",
        tags: ["7 Lessons", "7 Days", "7 Great Ways to Training"],
        isFree: true,
        image: "/images/CardTwo/p1.png",

        sessions: Array.from({ length: 7 }, (_, i) => ({
            id: i + 1,
            title: "(Video Title)",
            lessonNum: `${i + 1} Lesson`,
            time: `${i + 1} Day | 4:56 Min`,
            duration: 5,
            image: `/images/lessons/lesson${i + 1}.png`,
            videoUrl: "/videos/sample.mp4",
            description: "This lesson covers the fundamentals of basic training and bonding.",
            completed: false,
            isActive: true,
        }))
    },

    {
        program: 'intermediate',
        title: "Intermediate Training",
        description: "Discipline, behavior shaping, control.",
        color: "bg-[#E29587]",
        textColor: "text-white",
        tags: ["14 Lessons", "14 Days", "14 Great Ways to Training"],
        isFree: false,
        image: "/images/CardTwo/inter.png",

        sessions: Array.from({ length: 14 }, (_, i) => ({
            id: i + 1,
            title: "(Video Title)",
            lessonNum: `${i + 1} Lesson`,
            time: `${i + 1} Day | 6:10 Min`,
            duration: 6,
            image: `/images/lessons/lesson${(i % 7) + 1}.png`,
            videoUrl: "/videos/sample.mp4",
            description: "This lesson covers the fundamentals of basic training and bonding.",
            completed: false,
            isActive: false,
        }))
    },

    {
        program: 'advanced',
        title: "Advanced Training",
        description: "Master-level commands, agility, obedience.",
        color: "bg-[#6366F1]",
        textColor: "text-white",
        tags: ["12 Lessons", "21 Days", "21 Great Ways to Training"],
        isFree: false,
        image: "/images/CardTwo/adv.png",

        sessions: Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            title: "(Video Title)",
            lessonNum: `${i + 1} Lesson`,
            time: `${i + 1} Day | 7:20 Min`,
            duration: 7,
            image: `/images/lessons/lesson${(i % 7) + 1}.png`,
            videoUrl: "/videos/sample.mp4",
            description: "This lesson covers the fundamentals of basic training and bonding.",
            completed: false,
            isActive: false,
        }))
    }
];