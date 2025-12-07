
import React, { useState } from 'react';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <Link 
      to={`/properties/${property.id}`} 
      className="group block relative w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Status Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
           <span className="bg-white text-slate-900 text-[10px] font-extrabold px-2 py-1 rounded-sm shadow-md uppercase tracking-wide">
               {property.listingType === 'Sale' ? 'For Sale' : 'For Rent'}
           </span>
           {property.status !== 'Available' && (
             <span className="bg-amber-400 text-amber-900 text-[10px] font-extrabold px-2 py-1 rounded-sm shadow-md uppercase tracking-wide">
               {property.status}
             </span>
           )}
        </div>

        {/* Action Badges - Top Right */}
        <div className="absolute top-3 right-3 flex gap-2">
            <button className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all">
                <Heart size={20} className="drop-shadow-sm" />
            </button>
        </div>
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Content */}
      <div className="p-5">
         <div className="flex justify-between items-start mb-1">
             <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatPrice(property.price)}
                {property.listingType === 'Rent' && <span className="text-base font-normal text-slate-500">/mo</span>}
             </div>
         </div>
         
         <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 text-sm mb-3 font-medium">
             {property.type !== 'Land' && property.type !== 'Commercial' ? (
                <>
                  <span className="flex items-center gap-1"><strong>{property.bedrooms}</strong> bds</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1"><strong>{property.bathrooms}</strong> ba</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1"><strong>{property.sqft}</strong> sqft</span>
                </>
             ) : (
                <span className="flex items-center gap-1"><strong>{property.sqft}</strong> sqft - {property.type}</span>
             )}
         </div>

         <div className="text-slate-600 dark:text-slate-400 text-sm truncate mb-3">
             {property.address}, {property.city}, {property.state}
         </div>

         <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
             <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                 {property.type.toUpperCase()}
             </div>
             <div className="text-[10px] font-bold text-zillow-600">
                 {property.agent.agencyName.toUpperCase()}
             </div>
         </div>
      </div>
      
      {/* Bottom Color Bar - Zillow Blue */}
      <div className="h-1 w-full bg-zillow-600 absolute bottom-0 left-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
    </Link>
  );
};
