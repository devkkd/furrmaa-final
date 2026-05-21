// src/data/products.js

export const products = [
  {
    _id: "prod001",
    name: "Canine Creek Club Ultra Premium Dry Dog Food",
    description: "High-protein dry dog food suitable for all life stages. Supports digestion, immunity, and healthy coat.",
    category: "food",
    petType: ["dog"],
    price: 2499,
    discountPrice: 2229,
    images: ["/images/products/p1.png"],
    stock: 25,
    brand: "Canine Creek",
    rating: 4.5,
    reviews: [
      {
        user: "65abc123user",
        rating: 5,
        comment: "My dog loves it. Coat quality improved in 2 weeks.",
        date: "2025-10-12T09:30:00Z"
      }
    ],
    isActive: true,
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-10T12:00:00Z"
  },

  {
    _id: "prod002",
    name: "Rubber Chew Bone Toy for Dogs",
    description: "Durable rubber chew toy designed to reduce anxiety and improve dental health.",
    category: "toys",
    petType: ["dog"],
    price: 499,
    discountPrice: 399,
    images: ["/images/products/p2.png"],
    stock: 60,
    brand: "PetFun",
    rating: 4.2,
    reviews: [],
    isActive: true,
    createdAt: "2025-10-05T08:15:00Z",
    updatedAt: "2025-10-05T08:15:00Z"
  },

  {
    _id: "prod003",
    name: "Soft Plush Cat Bed",
    description: "Comfortable and warm plush bed for cats. Ideal for indoor sleeping and lounging.",
    category: "bedding",
    petType: ["cat"],
    price: 1299,
    discountPrice: 1099,
    images: ["/images/products/p3.png"],
    stock: 15,
    brand: "CozyPaws",
    rating: 4.7,
    reviews: [
      {
        user: "65abc999user",
        rating: 5,
        comment: "Very soft and my cat sleeps all day in it.",
        date: "2025-11-01T14:20:00Z"
      }
    ],
    isActive: true,
    createdAt: "2025-10-20T11:45:00Z",
    updatedAt: "2025-11-01T14:20:00Z"
  },
  {
    _id: "prod004",
    name: "Soft Plush Cat Bed",
    description: "Comfortable and warm plush bed for cats. Ideal for indoor sleeping and lounging.",
    category: "bedding",
    petType: ["cat"],
    price: 1299,
    discountPrice: 1099,
    images: ["/images/products/p1.png"],
    stock: 15,
    brand: "CozyPaws",
    rating: 4.7,
    reviews: [
      {
        user: "65abc999user",
        rating: 5,
        comment: "Very soft and my cat sleeps all day in it.",
        date: "2025-11-01T14:20:00Z"
      }
    ],
    isActive: true,
    createdAt: "2025-10-20T11:45:00Z",
    updatedAt: "2025-11-01T14:20:00Z"
  },
  {
    _id: "prod005",
    name: "Rubber Chew Bone Toy for Dogs",
    description: "Comfortable and warm plush bed for cats. Ideal for indoor sleeping and lounging.",
    category: "bedding",
    petType: ["dog"],
    price: 1299,
    discountPrice: 1099,
    images: ["/images/products/p6.png"],
    stock: 15,
    brand: "CozyPaws",
    rating: 4.7,
    reviews: [
      {
        user: "65abc999user",
        rating: 5,
        comment: "Very soft and my cat sleeps all day in it.",
        date: "2025-11-01T14:20:00Z"
      }
    ],
    isActive: true,
    createdAt: "2025-10-20T11:45:00Z",
    updatedAt: "2025-11-01T14:20:00Z"
  },
  {
    _id: "prod006",
    name: "Soft Plush Cat Bed",
    description: "Comfortable and warm plush bed for cats. Ideal for indoor sleeping and lounging.",
    category: "bedding",
    petType: ["cat"],
    price: 1299,
    discountPrice: 1099,
    images: ["/images/products/p6.png"],
    stock: 15,
    brand: "CozyPaws",
    rating: 4.7,
    reviews: [
      {
        user: "65abc999user",
        rating: 5,
        comment: "Very soft and my cat sleeps all day in it.",
        date: "2025-11-01T14:20:00Z"
      }
    ],
    isActive: true,
    createdAt: "2025-10-20T11:45:00Z",
    updatedAt: "2025-11-01T14:20:00Z"
  }

];

// {
//     name: "Premium Dog Dry Food",
//     description: "High protein dry food made for adult dogs to support strong muscles and digestion.",
//     category: "food",
//     petType: ["dog"],
//     price: 2499,
//     discountPrice: 2199,
//     images: [
//       "https://example.com/images/dog-food-1.jpg",
//       "https://example.com/images/dog-food-2.jpg"
//     ],
//     stock: 120,
//     brand: "PetCare Plus",
//     rating: 4.5,
//     reviews: [
//       {
//         user: "65f1c2a9e3a8b4d9f1234567",
//         rating: 5,
//         comment: "My dog loves it. Good quality.",
//         date: "2025-01-10T10:30:00.000Z"
//       },
//       {
//         user: "65f1c2a9e3a8b4d9f7654321",
//         rating: 4,
//         comment: "Good product but slightly expensive.",
//         date: "2025-01-12T14:20:00.000Z"
//       }
//     ],
//     isActive: true
//   },