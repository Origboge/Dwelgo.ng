
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_PROPERTIES } from '../constants';
import { Button } from '../components/Button';
import { AgentCard } from '../components/AgentCard';
import { useAuth } from '../context/AuthContext';
import { MapPin, Bed, Bath, Move, ArrowLeft, Play, Share2, Heart, CheckCircle2, Lock, Map } from 'lucide-react';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const property = MOCK_PROPERTIES.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Property Not Found</h2>
          <Link to="/properties"><Button variant="primary">Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
  };

  const handleMapClick = () => {
     if (property.latitude && property.longitude) {
         window.open(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`, '_blank');
     } else {
         window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address + ' ' + property.city)}`, '_blank');
     }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-white pb-20 bg-white dark:bg-[#0a0a0a]">
      
      {/* Navbar Placeholder/Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 pt-20 pb-4">
          <div className="container mx-auto px-6">
              <Link to="/properties" className="text-zillow-600 hover:underline flex items-center text-sm font-medium mb-2">
                 <ArrowLeft size={16} className="mr-1" /> Back to search
              </Link>
          </div>
      </div>

      {/* NEW IMAGE LAYOUT: Main Image Top, Thumbnails Below */}
      <div className="container mx-auto px-6 pt-6">
          {/* Main Large Image */}
          <div className="w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden shadow-sm mb-4 relative group bg-gray-100 dark:bg-slate-800">
               <img src={property.imageUrl} className="w-full h-full object-cover" alt="Main Property View" />
          </div>

          {/* Row of Additional Images */}
          {property.gallery && property.gallery.length > 0 && (
             <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                 {property.gallery.map((img, idx) => (
                     <div key={idx} className="shrink-0 w-64 h-40 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 snap-start bg-gray-100 dark:bg-slate-800">
                         <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                     </div>
                 ))}
             </div>
          )}
      </div>

      <div className="container mx-auto px-6 py-8">
         <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Main Content */}
            <div className="lg:w-2/3">
               
               {/* Header Info */}
               <div className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-8">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                           {formatPrice(property.price)}
                           {property.listingType === 'Rent' && <span className="text-xl font-normal text-slate-500">/mo</span>}
                        </div>
                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 text-lg mb-2">
                            {property.type !== 'Land' && property.type !== 'Commercial' && (
                                <>
                                    <span className="font-bold">{property.bedrooms} <span className="font-normal text-slate-500">bds</span></span>
                                    <span className="font-bold">{property.bathrooms} <span className="font-normal text-slate-500">ba</span></span>
                                </>
                            )}
                            <span className="font-bold">{property.sqft} <span className="font-normal text-slate-500">sqft</span></span>
                             <span className="text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase tracking-wide font-bold">{property.type}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                           {property.address}, {property.city}, {property.state}
                        </p>
                        
                        {/* Map Button */}
                        <Button 
                            variant="secondary" 
                            size="sm"
                            className="text-zillow-600 bg-blue-50 hover:bg-blue-100 border-none"
                            onClick={handleMapClick}
                        >
                            <MapPin size={16} className="mr-2" /> View on Map
                        </Button>
                     </div>
                     <div className="flex gap-3">
                         <Button variant="outline" className="flex items-center gap-2 border-zillow-600 text-zillow-600 hover:bg-zillow-50">
                             <Heart size={18} /> Save
                         </Button>
                         <Button variant="ghost" className="text-zillow-600 hover:bg-zillow-50">
                             <Share2 size={18} /> Share
                         </Button>
                     </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mt-1.5"></span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {property.listingType === 'Sale' ? 'For Sale' : 'For Rent'} - {property.status}
                      </span>
                  </div>
               </div>
               
               {/* Video Section - Moved Here */}
               {property.videoUrls && property.videoUrls.length > 0 && (
                  <div className="mb-10 p-1 bg-black rounded-xl overflow-hidden shadow-lg">
                     <div className="aspect-video w-full relative group">
                        <video 
                           src={property.videoUrls[0]} 
                           controls 
                           className="w-full h-full object-contain"
                           poster={property.imageUrl}
                        />
                     </div>
                  </div>
               )}

               {/* Description */}
               <div className="mb-10">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Overview</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                     {property.description}
                  </p>
               </div>

               {/* Features */}
               <div className="mb-10">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Facts and features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 bg-gray-50 dark:bg-slate-900 p-6 rounded-lg">
                     {property.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                           <CheckCircle2 size={16} className="text-zillow-600" />
                           <span>{feature}</span>
                        </div>
                     ))}
                  </div>
               </div>

            </div>

            {/* Sidebar Contact */}
            <div className="lg:w-1/3">
               <div className="sticky top-24">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg p-6">
                     <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Contact Agent</h3>
                     
                     <div className="flex items-center gap-3 mb-6">
                         <img src={property.agent.avatar} className="w-12 h-12 rounded-full object-cover" />
                         <div>
                             <div className="font-bold text-slate-900 dark:text-white">{property.agent.firstName} {property.agent.lastName}</div>
                             <div className="text-xs text-slate-500">{property.agent.agencyName}</div>
                         </div>
                     </div>

                     {user ? (
                         <form className="space-y-3">
                             <input type="text" placeholder="Your Name" className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-zillow-600" defaultValue={user.firstName + ' ' + user.lastName} />
                             <input type="text" placeholder="Phone" className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-zillow-600" />
                             <textarea rows={3} className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-zillow-600" defaultValue="I am interested in this property."></textarea>
                             
                             <Button variant="primary" className="w-full justify-center">Contact Agent</Button>
                             <div className="text-xs text-slate-400 text-center mt-2">
                                 By clicking Contact Agent, you agree that PropertyHub and real estate professionals may call/text you about your inquiry.
                             </div>
                         </form>
                     ) : (
                         <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                             <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Sign in to contact the agent for this listing.</p>
                             <Button variant="primary" className="w-full justify-center" onClick={() => navigate('/login')}>Sign In</Button>
                         </div>
                     )}
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};
