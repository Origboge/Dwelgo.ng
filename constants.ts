

import { Property, Agent } from './types';

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'a1',
    firstName: 'Sarah',
    lastName: 'Connors',
    email: 'sarah@primeestates.ng',
    phone: '+234 800 123 4567',
    agencyName: 'Prime Estates NG',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    licenseNumber: 'REG-2023-8892',
    experience: 8,
    bio: 'Sarah is a top-performing agent specializing in luxury residential properties in Lagos. With over 8 years of experience, she helps clients find their dream homes with ease and transparency.',
    socials: {
      linkedin: 'sarah-connors',
      instagram: '@sarah_realestate'
    }
  },
  {
    id: 'a2',
    firstName: 'David',
    lastName: 'Okonkwo',
    email: 'david@luxuryhomes.ng',
    phone: '+234 800 987 6543',
    agencyName: 'Luxury Homes Ltd',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    licenseNumber: 'REG-2021-4451',
    experience: 5,
    bio: 'David is known for his extensive market knowledge of the Island property market. He specializes in commercial properties and high-end rentals.',
    socials: {
      twitter: '@david_okonkwo',
      linkedin: 'david-okonkwo-realtor'
    }
  },
  {
    id: 'a3',
    firstName: 'Zainab',
    lastName: 'Bello',
    email: 'zainab@abujaproperties.com',
    phone: '+234 700 555 1234',
    agencyName: 'Capital City Realtors',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    licenseNumber: 'REG-2019-1120',
    experience: 12,
    bio: 'Based in Abuja, Zainab brings over a decade of experience in navigating the complex real estate landscape of the FCT. She is dedicated to securing the best deals for her clients.',
    socials: {
      instagram: '@zainab_bello_properties'
    }
  }
];

// For backward compatibility if needed, though we should use MOCK_AGENTS mostly
export const MOCK_AGENT = MOCK_AGENTS[0];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Neon Heights Penthouse',
    address: '101 Victoria Island Way',
    city: 'Lagos',
    state: 'Lagos',
    price: 450000000,
    type: 'Apartment',
    listingType: 'Sale',
    bedrooms: 4,
    bathrooms: 5,
    sqft: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-275080c095e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1613545325268-9365fd6436ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    videoUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    ],
    agent: MOCK_AGENTS[0], // Sarah
    features: ['Swimming Pool', 'Smart Home', '24/7 Power', 'Helipad', 'Private Elevator', 'Rooftop Terrace'],
    isFeatured: true,
    status: 'Available',
    description: 'Experience luxury living at its finest in the heart of Victoria Island. This penthouse offers panoramic views of the Atlantic Ocean and the Lagos skyline. Featuring a private elevator, smart home automation, and a rooftop terrace perfect for entertaining.',
    addedAt: '2023-10-01',
    latitude: 6.4281,
    longitude: 3.4219
  },
  {
    id: 'p2',
    title: 'Lekki Phase 1 Modern Villa',
    address: '42 Admiralty Way',
    city: 'Lekki',
    state: 'Lagos',
    price: 15000000,
    type: 'Villa',
    listingType: 'Rent',
    bedrooms: 5,
    bathrooms: 6,
    sqft: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    gallery: [
       'https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
       'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
       'https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
       'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
       'https://images.unsplash.com/photo-1593696140826-c58b0971b650?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    videoUrls: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'],
    agent: MOCK_AGENTS[1], // David
    features: ['Garden', 'Security', 'Gym', 'Parking', 'Home Theater', 'Staff Quarters'],
    isFeatured: true,
    status: 'Available',
    description: 'A masterpiece of modern architecture. Perfect for families looking for space and security. This fully serviced villa comes with a dedicated facility manager, lush gardens, and a state-of-the-art home theater.',
    addedAt: '2023-10-05',
    latitude: 6.4500,
    longitude: 3.4800
  },
  {
    id: 'p3',
    title: 'Abuja Central Loft',
    address: '55 Wuse II Crescent',
    city: 'Abuja',
    state: 'FCT',
    price: 85000000,
    type: 'Apartment',
    listingType: 'Sale',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    gallery: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1556912172-45b7abe8d7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1513584685908-95c9e2d01977?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    videoUrls: [],
    agent: MOCK_AGENTS[2], // Zainab
    features: ['Gym', '24/7 Power', 'Central AC', 'Concierge'],
    isFeatured: false,
    status: 'Available',
    description: 'Urban living defined. Close to all major government parastatals and business districts. This industrial-chic loft offers high ceilings, exposed brick walls, and premium finishes.',
    addedAt: '2023-10-10',
    latitude: 9.0765,
    longitude: 7.3986
  },
  {
    id: 'p4',
    title: 'Banana Island Mansion',
    address: 'Plot 4, Banana Island',
    city: 'Ikoyi',
    state: 'Lagos',
    price: 1200000000,
    type: 'House',
    listingType: 'Sale',
    bedrooms: 7,
    bathrooms: 9,
    sqft: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    gallery: [
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1512918760513-95f1929c2710?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    videoUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    ],
    agent: MOCK_AGENTS[0], // Sarah
    features: ['Swimming Pool', 'Cinema', 'Jetty', 'Smart Home', 'Elevator', 'Wine Cellar'],
    isFeatured: true,
    status: 'Available',
    description: 'The pinnacle of Nigerian luxury real estate. Direct water access and state-of-the-art security. This mansion is designed for the elite, offering privacy, exclusivity, and unmatched opulence.',
    addedAt: '2023-10-12',
    latitude: 6.4550,
    longitude: 3.4350
  },
  {
    id: 'p5',
    title: 'Prime Commercial Hub',
    address: '20 Marina Road',
    city: 'Lagos Island',
    state: 'Lagos',
    price: 5000000,
    type: 'Commercial',
    listingType: 'Rent',
    bedrooms: 0,
    bathrooms: 2,
    sqft: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    gallery: [
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1504384308090-c54be385548c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    videoUrls: [],
    agent: MOCK_AGENTS[1], // David
    features: ['Open Plan', 'Conference Room', 'Server Room', 'High Speed Internet', 'Parking'],
    isFeatured: true, // Promoted
    status: 'Available',
    description: 'A modern commercial space in the heart of the business district. Ideal for tech startups or consulting firms. Features an open plan layout and high-speed fiber internet.',
    addedAt: '2023-10-15',
    latitude: 6.4560,
    longitude: 3.3920
  },
  {
    id: 'p6',
    title: 'Epe Development Land',
    address: 'Km 15 Epe-Lekki Expressway',
    city: 'Epe',
    state: 'Lagos',
    price: 8000000,
    type: 'Land',
    listingType: 'Sale',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 6000, // Plot size
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    gallery: [
        'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c7dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    videoUrls: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'],
    agent: MOCK_AGENTS[1], // David
    features: ['C of O', 'Dry Land', 'Fenced', 'Road Access'],
    isFeatured: true, // Promoted
    status: 'Available',
    description: 'Strategic investment opportunity in the rapidly developing Epe axis. Dry land with Certificate of Occupancy. Perfect for residential estate development or land banking.',
    addedAt: '2023-10-18',
    latitude: 6.5841,
    longitude: 3.9754
  },
  {
    id: 'p7',
    title: 'Victoria Island Retail Space',
    address: 'Adetokunbo Ademola Street',
    city: 'Victoria Island',
    state: 'Lagos',
    price: 12000000,
    type: 'Commercial',
    listingType: 'Rent',
    bedrooms: 0,
    bathrooms: 1,
    sqft: 800,
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    gallery: [
        'https://images.unsplash.com/photo-1565514020176-db792f4b6d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1556740758-90de2929450a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1481437156560-3205f6a55735?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    videoUrls: [],
    agent: MOCK_AGENTS[0],
    features: ['High Footfall', 'Glass Frontage', 'Security', 'Parking'],
    isFeatured: true,
    status: 'Available',
    description: 'Premium retail space on one of the busiest streets in Victoria Island. High visibility glass frontage perfect for a boutique or showroom.',
    addedAt: '2023-10-20',
    latitude: 6.4290,
    longitude: 3.4250
  }
];

export const PROPERTY_TYPES = ['All', 'House', 'Apartment', 'Condo', 'Villa', 'Land', 'Commercial'];
