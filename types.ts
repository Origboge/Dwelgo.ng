
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  avatar?: string;
  isVerified?: boolean;
  agencyName?: string;
  phone?: string;
  bio?: string;
  licenseNumber?: string;
  experience?: number;
  specialties?: string[];
  location?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  savedPropertyIds?: string[]; // Array of property IDs that the user has liked/saved
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  agencyName: string;
  rating: number;
  ratingCount?: number;
  licenseNumber?: string;
  bio?: string;
  experience?: number; // Years of experience
  socials?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  location?: string;
  savedPropertyIds?: string[];
  userId?: string | { _id: string, [key: string]: any }; // Allow access to raw user ID/Object
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  type: 'House' | 'Apartment' | 'Condo' | 'Land' | 'Villa' | 'Commercial';
  listingType: 'Sale' | 'Rent' | 'Land';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  gallery: string[];
  videoUrls?: string[]; // Changed to support multiple videos
  agent: Agent;
  features: string[];
  isFeatured?: boolean;
  status: 'Available' | 'Pending' | 'Sold' | 'Rented' | 'Archived';
  description: string;
  addedAt: string;
  latitude?: number;
  longitude?: number;
  priceFrequency?: 'Year' | 'Month' | 'Night';
  plots?: number;
}

export interface PropertyFilters {
  search: string;
  type: string;
  listingType: 'Sale' | 'Rent' | 'Land' | 'All';
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
}
