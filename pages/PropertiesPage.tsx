import React, { useState, useMemo, useEffect } from 'react';
import { PROPERTY_TYPES } from '../constants';
import { propertyService } from '../services/PropertyService';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const PropertiesPage: React.FC = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [selectedType, setSelectedType] = useState('All');
  const [listingType, setListingType] = useState<'All' | 'Sale' | 'Rent' | 'Land'>('All');
  const [priceRange, setPriceRange] = useState<number>(2000000000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Data State
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // In future: Pass filters to backend
        const data = await propertyService.getAllProperties();
        setProperties(data as any);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter Logic
  const filteredProperties = useMemo(() => {
    return properties.filter((prop: any) => {
      const matchesSearch =
        prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || prop.type === selectedType;
      const matchesListing = listingType === 'All' ||
        (listingType === 'Land' ? (prop.type === 'Land' || prop.listingType === 'Land') : prop.listingType === listingType);
      const matchesPrice = prop.price <= priceRange;

      return matchesSearch && matchesType && matchesListing && matchesPrice;
    });
  }, [properties, searchTerm, selectedType, listingType, priceRange]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Real Estate & Homes for Sale</h1>
          <div className="h-1 w-20 bg-zillow-600 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className={`
            lg:w-1/4 lg:block 
            ${showMobileFilters ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-6 overflow-y-auto' : 'hidden'}
            lg:sticky lg:top-24 lg:h-fit
          `}>

            <div className="flex justify-between items-center lg:hidden mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-slate-900 dark:text-white"><X /></button>
            </div>

            <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              {/* Search */}
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      // Suggestion Logic
                      if (val.length > 1) {
                        const lower = val.toLowerCase();
                        const matches = new Set<string>();
                        properties.forEach((p: any) => {
                          const city = p.city || '';
                          const state = p.state || '';
                          const fullAddress = p.address || '';
                          const segments = fullAddress.split(',').map((s: string) => s.trim());

                          if (city && city.toLowerCase().includes(lower)) matches.add(city);
                          if (state && state.toLowerCase().includes(lower)) matches.add(state);

                          segments.forEach((seg: string) => {
                            if (seg.toLowerCase().includes(lower) && seg.length < 50) {
                              if (seg.toLowerCase() !== city.toLowerCase() && seg.toLowerCase() !== state.toLowerCase()) {
                                matches.add(seg);
                              }
                            }
                          });
                        });
                        // @ts-ignore
                        setSuggestions(Array.from(matches).slice(0, 5));
                        // @ts-ignore
                        setShowSuggestions(true);
                      } else {
                        // @ts-ignore
                        setShowSuggestions(false);
                      }
                    }}
                    placeholder="City, Neighborhood, ZIP"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:border-zillow-600 focus:ring-1 focus:ring-zillow-600 outline-none transition-all"
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
                {/* Suggestions Dropdown */}
                {/* @ts-ignore */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                    {/* @ts-ignore */}
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors"
                        onClick={() => {
                          setSearchTerm(suggestion);
                          // @ts-ignore
                          setShowSuggestions(false);
                        }}
                      >
                        <Search size={14} className="text-gray-400" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">For Sale / Rent</label>
                <div className="flex rounded-md shadow-sm" role="group">
                  <button
                    onClick={() => setListingType('All')}
                    className={`flex-1 py-2 text-sm font-medium border border-gray-300 dark:border-slate-700 rounded-l-md ${listingType === 'All'
                      ? 'bg-zillow-50 text-zillow-600 border-zillow-600 z-10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50'
                      }`}
                  >
                    Any
                  </button>
                  <button
                    onClick={() => setListingType('Sale')}
                    className={`flex-1 py-2 text-sm font-medium border-t border-b border-gray-300 dark:border-slate-700 ${listingType === 'Sale'
                      ? 'bg-zillow-50 text-zillow-600 border-zillow-600 z-10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50'
                      }`}
                  >
                    Sale
                  </button>
                  <button
                    onClick={() => setListingType('Rent')}
                    className={`flex-1 py-2 text-sm font-medium border border-gray-300 dark:border-slate-700 ${listingType === 'Rent'
                      ? 'bg-zillow-50 text-zillow-600 border-zillow-600 z-10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50'
                      }`}
                  >
                    Rent
                  </button>
                  <button
                    onClick={() => setListingType('Land')}
                    className={`flex-1 py-2 text-sm font-medium border border-gray-300 dark:border-slate-700 rounded-r-md ${listingType === 'Land'
                      ? 'bg-zillow-50 text-zillow-600 border-zillow-600 z-10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50'
                      }`}
                  >
                    Land
                  </button>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Home Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md p-2.5 text-slate-900 dark:text-white outline-none focus:border-zillow-600 focus:ring-1 focus:ring-zillow-600"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Max Price: <span className="text-zillow-600">₦{(priceRange / 1000000).toFixed(0)}M</span>
                </label>
                <input
                  type="range"
                  min="1000000"
                  max="2000000000"
                  step="5000000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-zillow-600"
                />
              </div>

              <Button
                variant="primary"
                className="w-full lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600 dark:text-slate-400 font-medium">{filteredProperties.length} results</p>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <SlidersHorizontal size={16} className="mr-2" /> Filters
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
                  <select className="bg-transparent text-sm font-bold text-zillow-600 border-none outline-none focus:ring-0 cursor-pointer hover:underline">
                    <option>Newest</option>
                    <option>Price (High to Low)</option>
                    <option>Price (Low to High)</option>
                    <option>Bedrooms</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No homes match your search</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Try removing some filters or changing your search area.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('All');
                    setListingType('All');
                    setPriceRange(2000000000);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};