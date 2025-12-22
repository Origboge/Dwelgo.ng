
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowDown, Home, Key, DollarSign, Briefcase, Megaphone, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { PropertyCard } from '../components/PropertyCard';
import { propertyService } from '../services/PropertyService';
import { ScrollReveal } from '../components/ScrollReveal';
import { useAuth } from '../context/AuthContext';

type TabType = 'sale' | 'rent' | 'land_commercial';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offset, setOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  // Data State
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [latestProperties, setLatestProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]); // For search suggestions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // Run fetches in parallel so one slow query doesn't block the others
        const [allRes, featuredRes, latestRes] = await Promise.allSettled([
          propertyService.getAllProperties({ limit: 100 }), // LIMIT SEARCH TO 100 TO PREVENT TIMEOUT
          propertyService.getAllProperties({ isFeatured: true, limit: 4 }),
          propertyService.getAllProperties({ limit: 4 })
        ]);

        if (allRes.status === 'fulfilled') setAllProperties(allRes.value);
        if (featuredRes.status === 'fulfilled') setFeaturedProperties(featuredRes.value);
        if (latestRes.status === 'fulfilled') setLatestProperties(latestRes.value);
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    };

    const handleScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    fetchHomeData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const lowerQuery = query.toLowerCase();
      // Filter unique cities and addresses
      const matches = new Set<string>();

      allProperties.forEach(p => {
        const city = p.city || '';
        const state = p.state || '';
        const fullAddress = p.address || '';

        // 1. Suggest City/State if they match
        if (city && city.toLowerCase().includes(lowerQuery)) matches.add(city);
        if (state && state.toLowerCase().includes(lowerQuery)) matches.add(state);

        // 2. Scan address segments (split by comma) for the keyword
        // e.g. "No 2, Omojuwa Avenue, Kajola" -> ["No 2", "Omojuwa Avenue", "Kajola"]
        const segments = fullAddress.split(',').map((s: string) => s.trim());

        segments.forEach((seg: string) => {
          // If this specific segment matches the query (and isn't too long/noisy), suggest it.
          if (seg.toLowerCase().includes(lowerQuery) && seg.length < 50) {
            // Avoid duplicates if it's just the city again
            if (seg.toLowerCase() !== city.toLowerCase() && seg.toLowerCase() !== state.toLowerCase()) {
              matches.add(seg);
            }
          }
        });
      });

      setSuggestions(Array.from(matches).slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate('/properties', { state: { searchTerm: suggestion } });
  };

  const handleAdvertiseClick = () => {
    if (!user) {
      alert("Please sign up first to start advertising your properties on Dwelgo.ng");
      navigate('/register?redirect=/advertise&role=agent');
    } else {
      navigate('/advertise');
    }
  };

  // Filter Logic for tabs (Client-side filtering of the fetched Featured list)
  const displayedProperties = useMemo(() => {
    return featuredProperties.filter(p => {
      // Handle Land filter specifically
      if (activeTab === 'land_commercial') {
        return p.type === 'Land' || p.listingType === 'Land';
      }

      const isLand = p.type === 'Land' || p.listingType === 'Land';
      if (isLand) return false;

      if (activeTab === 'sale') {
        return p.listingType === 'Sale';
      } else {
        return p.listingType === 'Rent';
      }
    }).slice(0, 4);
  }, [activeTab, featuredProperties]);


  return (
    <div className="bg-white dark:bg-[#0a0a0a]">

      {/* 1. HERO SECTION */}
      <div className="relative h-[600px] w-full overflow-hidden">
        {/* Background Layer - Switched to a brighter, clearer image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear scale-105 hover:scale-110 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=70")',
          }}
        />
        {/* Lighter overlay - subtle flat black to ensure text pops but image is bright */}
        <div className="absolute inset-0 bg-black/20 z-0" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pt-10">
          <ScrollReveal animation="fade-in-right">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 drop-shadow-xl tracking-tight">
              Experience Living
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-in-right" delay={200}>
            <p className="text-xl md:text-2xl text-white font-medium mb-10 max-w-2xl drop-shadow-md text-shadow">
              Discover a place you'll love to live.
            </p>
          </ScrollReveal>

          {/* Search Box Container */}
          <ScrollReveal animation="fade-in-up" delay={400} className="w-full max-w-4xl px-4">
            <div className="w-full bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-3 md:p-4 border border-white/20">
              <div className="flex flex-col md:flex-row gap-3 relative">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={(e) => {
                      e.target.readOnly = false;
                      if (searchQuery.length > 1) setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                    placeholder="Enter an address, neighborhood, city, or ZIP code"
                    className="w-full h-14 px-5 rounded-md border border-gray-200 bg-white text-lg text-slate-900 placeholder:text-gray-400 focus:border-zillow-600 focus:ring-2 focus:ring-zillow-100 outline-none transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/properties', { state: { searchTerm: searchQuery } })}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    readOnly
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-5 py-3 hover:bg-gray-50 cursor-pointer text-left text-slate-700 font-medium border-b border-gray-50 last:border-none flex items-center gap-3 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Search size={16} className="text-gray-400" />
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="absolute right-4 top-4 text-gray-400 md:hidden">
                    <Search size={24} />
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="h-14 w-full md:w-auto px-10 rounded-md text-lg shadow-lg hover:shadow-zillow-600/30"
                  onClick={() => navigate('/properties', { state: { searchTerm: searchQuery } })}
                >
                  <span className="hidden md:inline">Search</span>
                  <span className="md:hidden">Search Homes</span>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* 2. STATS / FEATURES BAR */}
      <div className="bg-zillow-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold text-zillow-600 mb-1">2,500+</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Dwelgo.ng Homes</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* INTRO */}
        <ScrollReveal animation="fade-in-down">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Discover your new favorite place
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Whether you’re buying, selling or renting, we can help you move forward.
            </p>
          </div>
        </ScrollReveal>

        {/* CATEGORIZED LISTINGS */}
        <ScrollReveal animation="fade-in-up">
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
                  Land
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
        </ScrollReveal>

        {/* JOIN AS REALTOR CTA SECTION */}
        <ScrollReveal animation="fade-in-left">
          <div className="relative bg-zillow-600 rounded-3xl overflow-hidden shadow-2xl mb-24 text-white min-h-[400px] flex items-center">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=70"
                alt="Agent Background"
                className="w-full h-full object-cover opacity-20 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zillow-800 to-transparent"></div>
            </div>

            <div className="relative z-10 grid md:grid-cols-2 items-center w-full">
              <div className="p-8 md:p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-bold px-4 py-1.5 rounded-full text-xs mb-6 border border-white/30 w-fit whitespace-nowrap">
                  <Briefcase size={14} className="shrink-0" />
                  <span>For Real Estate Professionals</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">Grow your business with Dwelgo.ng</h2>
                <p className="text-white/90 text-lg mb-8 leading-relaxed max-w-xl">
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
              <div className="hidden md:block pr-12">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=70"
                    alt="Agent Dashboard"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* LATEST LISTINGS SECTION */}
        <ScrollReveal animation="fade-in-up">
          <div className="mb-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Latest on the Market</h2>
              {/* Banner removed as requested */}
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
        </ScrollReveal>
      </div>

      {/* 4. ADVERTISE SECTION */}
      <ScrollReveal animation="fade-in-right">
        <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-950 to-zillow-900 text-white py-24 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=70"
              alt="Ad Background"
              className="w-full h-full object-cover opacity-10 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-16">
              <div className="md:w-3/5">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-white/20">
                  <Megaphone size={16} /> Advertise with Dwelgo.ng
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Reach millions of buyers and renters.</h2>
                <p className="text-lg md:text-xl text-indigo-100 mb-8 leading-relaxed max-w-2xl">
                  Whether you're selling a single home or managing a large portfolio, our advertising platform puts your property in front of the right audience at the right time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="secondary"
                    className="bg-white text-indigo-950 border-none hover:bg-indigo-50 font-bold px-10 py-4 text-lg rounded-xl shadow-xl transition-all hover:scale-105"
                    onClick={handleAdvertiseClick}
                  >
                    Start Advertising
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block md:w-2/5">
                <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-3xl shadow-black/50 border border-white/20 group">
                  <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=70"
                    alt="Advertising Dashboard"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-900/40 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-white text-indigo-900 rounded-2xl flex items-center justify-center font-bold shadow-lg transform -rotate-6">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-2xl tracking-tight">Maximize ROI</p>
                        <p className="text-sm text-indigo-100 opacity-80">Data-driven performance tracking</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};
