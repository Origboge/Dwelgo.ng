
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowDown, Home, Key, DollarSign, Briefcase, Megaphone, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { PropertyCard } from '../components/PropertyCard';
import { MOCK_PROPERTIES } from '../constants';

type TabType = 'sale' | 'rent' | 'land_commercial';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('sale');

  useEffect(() => {
    const handleScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter Logic for tabs
  const displayedProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter(p => {
      // Show featured items first
      if (!p.isFeatured) return false;

      const isLandOrCommercial = p.type === 'Land' || p.type === 'Commercial';
      
      if (activeTab === 'land_commercial') {
        return isLandOrCommercial;
      } else if (activeTab === 'sale') {
        return !isLandOrCommercial && p.listingType === 'Sale';
      } else {
        return !isLandOrCommercial && p.listingType === 'Rent';
      }
    }).slice(0, 3);
  }, [activeTab]);

  // Get a different set of properties for the second section (e.g., newest)
  const latestProperties = useMemo(() => {
      // Just reversing to show different items for demo purposes
      return [...MOCK_PROPERTIES].reverse().slice(0, 3);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0a0a0a]">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[600px] w-full overflow-hidden">
         {/* Background Layer - Switched to a brighter, clearer image */}
         <div 
           className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear scale-105 hover:scale-110 z-0"
           style={{ 
             backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80")',
           }}
         />
         {/* Lighter overlay - subtle flat black to ensure text pops but image is bright */}
         <div className="absolute inset-0 bg-black/20 z-0" />
         
         {/* Content */}
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pt-10">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 drop-shadow-xl tracking-tight">
              Experience Living
            </h1>
            <p className="text-xl md:text-2xl text-white font-medium mb-10 max-w-2xl drop-shadow-md text-shadow">
              Discover a place you'll love to live.
            </p>
            
            {/* Search Box Container */}
            <div className="relative w-full max-w-4xl px-4">
                
                {/* POINTER ANIMATION */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center animate-bounce z-20">
                    <div className="bg-white text-zillow-600 px-6 py-2 rounded-full font-bold shadow-xl border-2 border-zillow-50 mb-2 whitespace-nowrap">
                        Start your search here
                    </div>
                    <ArrowDown className="text-white drop-shadow-md" size={32} />
                </div>

                <div className="w-full bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-3 md:p-4 animate-fade-in border border-white/20">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative group">
                            <input 
                              type="text" 
                              placeholder="Enter an address, neighborhood, city, or ZIP code" 
                              className="w-full h-14 px-5 rounded-md border border-gray-200 bg-white text-lg text-slate-900 placeholder:text-gray-400 focus:border-zillow-600 focus:ring-2 focus:ring-zillow-100 outline-none transition-all"
                              onKeyDown={(e) => e.key === 'Enter' && navigate('/properties')}
                              autoFocus
                            />
                            <div className="absolute right-4 top-4 text-gray-400 md:hidden">
                                <Search size={24} />
                            </div>
                        </div>
                        <Button 
                            variant="primary" 
                            className="h-14 w-full md:w-auto px-10 rounded-md text-lg shadow-lg hover:shadow-zillow-600/30"
                            onClick={() => navigate('/properties')}
                        >
                            <span className="hidden md:inline">Search</span>
                            <span className="md:hidden">Search Homes</span>
                        </Button>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* 2. STATS / FEATURES BAR */}
      <div className="bg-zillow-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-6 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div className="flex flex-col items-center">
                      <h3 className="text-3xl font-bold text-zillow-600 mb-1">2,500+</h3>
                      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Homes For Sale</p>
                  </div>
                  <div className="flex flex-col items-center">
                      <h3 className="text-3xl font-bold text-zillow-600 mb-1">850+</h3>
                      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Open Houses</p>
                  </div>
                  <div className="flex flex-col items-center">
                      <h3 className="text-3xl font-bold text-zillow-600 mb-1">120k+</h3>
                      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Monthly Visitors</p>
                  </div>
                  <div className="flex flex-col items-center">
                      <h3 className="text-3xl font-bold text-zillow-600 mb-1">#1</h3>
                      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Rated Agency</p>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="container mx-auto px-6 py-16">
         
         {/* INTRO */}
         <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
               Discover your new favorite place
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
               Whether you’re buying, selling or renting, we can help you move forward.
            </p>
         </div>

         {/* CATEGORIZED LISTINGS */}
         <div className="mb-24">
            {/* Header - Fixed Mobile Alignment (Centered on Mobile, End on Desktop) */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
               <div className="text-center md:text-left">
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                     Premium Collections
                   </h3>
                   <p className="text-slate-500 text-sm mt-1">Featured properties curated just for you</p>
               </div>
               
               {/* Tabs - Zillow Style */}
               <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                 <button 
                   onClick={() => setActiveTab('sale')}
                   className={`px-4 md:px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'sale' ? 'bg-white dark:bg-slate-700 text-zillow-600 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                 >
                   For Sale
                 </button>
                 <button 
                   onClick={() => setActiveTab('rent')}
                   className={`px-4 md:px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'rent' ? 'bg-white dark:bg-slate-700 text-zillow-600 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                 >
                   For Rent
                 </button>
                 <button 
                   onClick={() => setActiveTab('land_commercial')}
                   className={`px-4 md:px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'land_commercial' ? 'bg-white dark:bg-slate-700 text-zillow-600 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                 >
                   Commercial
                 </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {displayedProperties.map(prop => (
                   <PropertyCard key={prop.id} property={prop} />
               ))}
               {displayedProperties.length === 0 && (
                 <div className="col-span-3 flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-slate-900/50">
                   <Home size={48} className="text-gray-300 mb-4" />
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">No homes found</h3>
                   <p className="text-slate-500 dark:text-slate-400 mb-6">We couldn't find any featured properties in this category.</p>
                   <Button variant="primary" onClick={() => navigate('/properties')}>Browse All Listings</Button>
                 </div>
               )}
            </div>
            
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="px-10 border-zillow-600 text-zillow-600 hover:bg-zillow-50 font-bold" onClick={() => navigate('/properties')}>
                 View more homes
              </Button>
            </div>
         </div>

         {/* JOIN AS REALTOR CTA SECTION (Moved Here, Styled as Boxed Card) */}
         <div className="bg-zillow-600 rounded-3xl overflow-hidden shadow-2xl mb-24 text-white">
             <div className="grid md:grid-cols-2 items-center">
                 <div className="p-12">
                     <div className="inline-block bg-blue-500/30 text-blue-50 font-bold px-3 py-1 rounded-full text-xs mb-4 border border-blue-400/30 flex items-center gap-2 w-fit">
                       <Briefcase size={12} /> For Real Estate Professionals
                     </div>
                     <h2 className="text-4xl font-bold mb-6 leading-tight">Grow your business with PropertyHub</h2>
                     <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                       Connect with millions of buyers, sellers, and renters. Access our dashboard to manage listings, track leads, and build your personal brand.
                     </p>
                     <div className="flex flex-col sm:flex-row gap-4">
                       <Button 
                         variant="secondary" 
                         className="bg-white text-zillow-600 border-none hover:bg-blue-50 font-bold px-8 py-3"
                         onClick={() => navigate('/register?role=agent')}
                        >
                           Sign Up as Agent
                       </Button>
                       <Button 
                         variant="outline" 
                         className="border-white text-white hover:bg-white/10 font-bold px-8 py-3" 
                         onClick={() => navigate('/about')}
                        >
                           Learn More
                       </Button>
                     </div>
                 </div>
                 <div className="h-full min-h-[300px] relative">
                    <img 
                      src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                      alt="Agent Dashboard" 
                      className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 bg-zillow-900"
                    />
                 </div>
             </div>
         </div>

         {/* LATEST LISTINGS SECTION */}
         <div className="mb-8">
             <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Latest on the Market</h2>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-6 py-2 inline-flex flex-col sm:flex-row items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-300 font-medium text-sm text-center">
                        Browsing is always free. <Link to="/register" className="underline font-bold hover:text-green-900">Sign up</Link> to view agent details and contact info.
                    </span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                 {latestProperties.map(prop => (
                     <PropertyCard key={`new-${prop.id}`} property={prop} />
                 ))}
             </div>
             
             <div className="text-center">
                <Button variant="outline" onClick={() => navigate('/properties')}>See All New Listings</Button>
             </div>
         </div>

      </div>

      {/* 4. ADVERTISE SECTION (Moved Here, Styled as Full Width) */}
      <div className="bg-gradient-to-r from-indigo-900 to-zillow-900 text-white py-20">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-1/2">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                      <Megaphone size={16} /> Advertise with PropertyHub
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Reach millions of buyers and renters.</h2>
                  <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
                      Whether you're selling a single home or managing a large portfolio, our advertising platform puts your property in front of the right audience at the right time.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                       <Button 
                         variant="secondary" 
                         className="bg-white text-zillow-900 border-none hover:bg-indigo-50 font-bold px-8 py-3"
                         onClick={() => navigate('/advertise')}
                        >
                           Start Advertising
                       </Button>
                  </div>
              </div>
              <div className="md:w-1/2 relative h-[350px] w-full rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/50 border border-white/20 group">
                   <img 
                      src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                      alt="Advertising Dashboard"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
                   <div className="absolute bottom-6 left-6 text-white">
                       <div className="flex items-center gap-4 mb-2">
                           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold">
                               <DollarSign size={20} />
                           </div>
                           <div>
                               <p className="font-bold text-xl">Maximize ROI</p>
                           </div>
                       </div>
                       <p className="text-sm opacity-80 pl-14">Get detailed analytics and performance reports</p>
                   </div>
              </div>
          </div>
      </div>

    </div>
  );
};
