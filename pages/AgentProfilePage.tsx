
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_AGENTS, MOCK_PROPERTIES, PROPERTY_TYPES } from '../constants';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { 
    Phone, Mail, MapPin, Award, Star, Globe, Linkedin, Twitter, Instagram, ShieldCheck, 
    ArrowLeft, Building2, Plus, X, UploadCloud, Lock, Image as ImageIcon, 
    DollarSign, Home, CheckSquare, Maximize, BarChart3, Users, MousePointerClick, Crosshair
} from 'lucide-react';

export const AgentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const agent = MOCK_AGENTS.find(a => a.id === id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Strict check: User must be an agent and their ID must match the profile ID
  const isOwner = user?.role === 'agent' && user?.id === agent?.id;

  // Detailed Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    type: 'House',
    listingType: 'Sale',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    features: '',
    imageUrl: '',
    latitude: '',
    longitude: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setIsLocating(false);
      },
      (error) => {
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        setShowAddForm(false);
        alert("Property published successfully! (Demo)");
        // In a real app, this would refresh the list
    }, 1500);
  };

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-white text-slate-900">
        <h2 className="text-3xl font-bold mb-4">Agent Not Found</h2>
        <Link to="/agents"><Button variant="outline">Back to Directory</Button></Link>
      </div>
    );
  }

  const agentProperties = MOCK_PROPERTIES.filter(p => p.agent.id === agent.id);

  return (
    <div className="min-h-screen text-slate-900 bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header Image */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 pt-20 pb-8">
         <div className="container mx-auto px-6">
            <Link to="/agents" className="inline-flex items-center text-zillow-600 hover:underline text-sm mb-6">
                <ArrowLeft size={16} className="mr-1" /> Back to Agent Finder
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="relative">
                 <img 
                    src={agent.avatar} 
                    alt={agent.firstName} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                 />
                 <div className="absolute -bottom-2 -right-2 bg-white text-slate-900 font-bold px-2 py-1 rounded-full text-xs shadow border border-gray-200 flex items-center gap-1">
                    <Star size={10} className="fill-yellow-500 text-yellow-500" /> {agent.rating}
                 </div>
               </div>

               <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{agent.firstName} {agent.lastName}</h1>
                        <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">{agent.agencyName}</p>
                      </div>
                      {isOwner && (
                          <div className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-xs font-bold border border-green-200">
                              View as: Owner
                          </div>
                      )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6 mt-2">
                     <span className="flex items-center gap-1"><MapPin size={14} /> Lagos, Nigeria</span>
                     {agent.experience && <span className="flex items-center gap-1"><Award size={14} /> {agent.experience} Years Experience</span>}
                     {agent.licenseNumber && <span className="flex items-center gap-1"><ShieldCheck size={14} /> Lic: {agent.licenseNumber}</span>}
                  </div>

                  {!isOwner && (
                      user ? (
                        <div className="flex gap-3">
                           <Button variant="primary" className="flex gap-2">Contact Agent</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                           Sign in to contact
                        </Button>
                      )
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 py-12">
         <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar / Info */}
            <div className="lg:w-1/3 order-2 lg:order-1">
               <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Professional Information</h3>
                  <div className="space-y-4">
                     <div>
                        <p className="text-xs uppercase font-bold text-slate-500 mb-1">Bio</p>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {agent.bio || "Dedicated real estate professional committed to helping clients achieve their property goals."}
                        </p>
                     </div>
                     <div>
                        <p className="text-xs uppercase font-bold text-slate-500 mb-1">Specialties</p>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">Buyer's Agent, Listing Agent, Relocation, Consulting</p>
                     </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-4 text-zillow-600">
                     <Linkedin className="cursor-pointer hover:text-zillow-800" size={20} />
                     <Twitter className="cursor-pointer hover:text-zillow-800" size={20} />
                     <Instagram className="cursor-pointer hover:text-zillow-800" size={20} />
                     <Globe className="cursor-pointer hover:text-zillow-800" size={20} />
                  </div>
               </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3 order-1 lg:order-2">
               
               {/* Agent Dashboard Section - ONLY VISIBLE TO OWNER */}
               {isOwner && (
                  <div className="mb-10 animate-fade-in">
                     {/* Stats Row */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-zillow-600 flex items-center justify-center">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">12.5k</p>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Total Views</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">48</p>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Active Leads</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                                <MousePointerClick size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">3.2%</p>
                                <p className="text-xs text-slate-500 uppercase font-semibold">CTR</p>
                            </div>
                        </div>
                     </div>

                     <div className="bg-zillow-600 text-white rounded-lg p-6 shadow-md mb-6 relative overflow-hidden">
                         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Realtor Dashboard</h3>
                                <p className="text-blue-100 text-sm">Manage your portfolio and track performance.</p>
                            </div>
                            <Button 
                                variant="secondary"
                                className="bg-white text-zillow-600 hover:bg-blue-50 border-none shadow-sm font-bold"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                {showAddForm ? (
                                    <><X size={18} className="mr-2" /> Cancel</>
                                ) : (
                                    <><Plus size={18} className="mr-2" /> Post New Property</>
                                )}
                            </Button>
                        </div>
                        {/* Background Decor */}
                        <Building2 size={120} className="absolute -right-6 -bottom-6 text-white/10 rotate-12" />
                     </div>

                     {/* Add Property Form */}
                     {showAddForm && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 animate-slide-up shadow-xl mb-8 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-zillow-600 rounded-t-lg"></div>
                            <h4 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center">
                                <Home className="mr-2 text-zillow-600" size={24} />
                                New Listing Details
                            </h4>
                            
                            <form onSubmit={handlePublish}>
                                {/* Section 1: Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="Property Title" 
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Luxury Waterfront Villa" 
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Listing Type</label>
                                            <select 
                                                name="listingType"
                                                value={formData.listingType}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-shadow focus:ring-1 focus:ring-zillow-600"
                                            >
                                                <option value="Sale">For Sale</option>
                                                <option value="Rent">For Rent</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Property Type</label>
                                            <select 
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-shadow focus:ring-1 focus:ring-zillow-600"
                                            >
                                                {/* Explicitly listing Land and Commercial here as requested */}
                                                <option value="House">House</option>
                                                <option value="Apartment">Apartment</option>
                                                <option value="Condo">Condo</option>
                                                <option value="Villa">Villa</option>
                                                <option value="Land">Land / Plot</option>
                                                <option value="Commercial">Commercial</option>
                                            </select>
                                        </div>
                                    </div>

                                    <Input 
                                        label="Price (NGN)" 
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 150000000" 
                                        type="number" 
                                        icon={<span className="text-gray-500 font-bold">₦</span>}
                                        required
                                    />
                                </div>

                                {/* Section 2: Specs */}
                                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg mb-8 border border-gray-100 dark:border-gray-800">
                                    <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase">Property Specs</h5>
                                    {(formData.type !== 'Land' && formData.type !== 'Commercial') && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <Input 
                                                label="Beds" 
                                                name="bedrooms"
                                                value={formData.bedrooms}
                                                onChange={handleInputChange}
                                                type="number" 
                                            />
                                            <Input 
                                                label="Baths" 
                                                name="bathrooms"
                                                value={formData.bathrooms}
                                                onChange={handleInputChange}
                                                type="number" 
                                            />
                                            <Input 
                                                label="Sqft" 
                                                name="sqft"
                                                value={formData.sqft}
                                                onChange={handleInputChange}
                                                type="number" 
                                            />
                                        </div>
                                    )}
                                    {(formData.type === 'Land' || formData.type === 'Commercial') && (
                                         <div>
                                            <Input 
                                                label="Total Area (Sqft)" 
                                                name="sqft"
                                                value={formData.sqft}
                                                onChange={handleInputChange}
                                                type="number" 
                                            />
                                         </div>
                                    )}
                                </div>

                                {/* Section 3: Location & Description */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="Address" 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Street Address" 
                                            icon={<MapPin size={18} />}
                                            required
                                        />
                                    </div>
                                    <Input 
                                        label="City" 
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Input 
                                        label="State" 
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    
                                    {/* Location Pinning */}
                                    <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                                Precise Location (Lat/Long)
                                            </label>
                                            <Button 
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                className="text-xs py-1 h-8"
                                                onClick={handleGetCurrentLocation}
                                                disabled={isLocating}
                                            >
                                                {isLocating ? 'Locating...' : <><Crosshair size={14} className="mr-1"/> Pin Current Location</>}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input 
                                                label="Latitude" 
                                                name="latitude"
                                                value={formData.latitude}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 6.5244" 
                                            />
                                            <Input 
                                                label="Longitude" 
                                                name="longitude"
                                                value={formData.longitude}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 3.3792" 
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Use the "Pin Current Location" button while at the property to get accurate GPS coordinates. This allows users to find the location on Google Maps.
                                        </p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                        <textarea 
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-all focus:ring-1 focus:ring-zillow-600"
                                            placeholder="Describe the property highlights..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="px-12 py-3 text-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Publish Listing'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                     )}
                  </div>
               )}

               <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 flex justify-between items-end">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Current Listings ({agentProperties.length})</h3>
                  <div className="text-sm text-zillow-600 font-semibold cursor-pointer hover:underline">View All</div>
               </div>

               <div>
                  {agentProperties.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {agentProperties.map(property => (
                           <PropertyCard key={property.id} property={property} />
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <Home className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">No active properties listed.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
