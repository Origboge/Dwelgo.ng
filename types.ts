
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
  licenseNumber?: string;
  bio?: string;
  experience?: number; // Years of experience
  socials?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  type: 'House' | 'Apartment' | 'Condo' | 'Land' | 'Villa' | 'Commercial';
  listingType: 'Sale' | 'Rent';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  gallery: string[];
  videoUrls?: string[]; // Changed to support multiple videos
  agent: Agent;
  features: string[];
  isFeatured?: boolean;
  status: 'Available' | 'Pending' | 'Sold';
  description: string;
  addedAt: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFilters {
  search: string;
  type: string;
  listingType: 'Sale' | 'Rent' | 'All';
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
}
