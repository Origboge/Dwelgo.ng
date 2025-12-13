
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/PropertyService';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { MapPin, Share2, CheckCircle2, Phone, MessageCircle, Mail, AlertTriangle, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export const PropertyDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();

    // Data State
    const [property, setProperty] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLoginTooltip, setShowLoginTooltip] = useState(false);

    // Derived State
    const isLiked = property && user?.savedPropertyIds?.includes(property.id);

    const handleLike = async () => {
        if (!user) {
            setShowLoginTooltip(true);
            setTimeout(() => setShowLoginTooltip(false), 3000);
            return;
        }

        if (!property) return;

        const currentSaved = user.savedPropertyIds || [];
        let newSaved;
        if (isLiked) {
            newSaved = currentSaved.filter(id => id !== property.id);
        } else {
            newSaved = [...currentSaved, property.id];
        }
        await updateProfile({ savedPropertyIds: newSaved });
    };

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await propertyService.getPropertyById(id);
                setProperty(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zillow-600"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Property Not Found</h2>

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
            {/* Navigation / Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-zillow-600 hover:underline font-bold text-sm">
                    <ChevronLeft size={16} /> Back to Search
                </button>
            </div>

            {/* ERROR / LOADING HANDLED ABOVE */}

            {/* IMAGE GALLERY SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile: Carousel (Visible only on small screens) */}
                <div className="md:hidden relative h-[300px] rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 mb-6 group">
                    {/* Reuse existing carousel logic but with reduced height */}
                    <div
                        className="w-full h-full"
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            e.currentTarget.dataset.touchStartX = touch.clientX.toString();
                        }}
                        onTouchEnd={(e) => {
                            const touchStartX = parseFloat(e.currentTarget.dataset.touchStartX || '0');
                            const touchEndX = e.changedTouches[0].clientX;
                            const diff = touchStartX - touchEndX;
                            if (Math.abs(diff) > 50) {
                                const totalImages = (property.gallery?.length || 0) + 1;
                                if (diff > 0) setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
                                else setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
                            }
                        }}
                    >
                        <img
                            src={[property.imageUrl, ...(property.gallery || [])][currentImageIndex]}
                            className="w-full h-full object-cover transition-transform duration-500"
                            alt="Property"
                        />
                        {/* Mobile Controls */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i === 0 ? ([property.imageUrl, ...(property.gallery || [])].length - 1) : i - 1) }} className="bg-black/20 p-1 rounded-full text-white pointer-events-auto backdrop-blur-sm"><ChevronLeft size={20} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i === ([property.imageUrl, ...(property.gallery || [])].length - 1) ? 0 : i + 1) }} className="bg-black/20 p-1 rounded-full text-white pointer-events-auto backdrop-blur-sm"><ChevronRight size={20} /></button>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                            {currentImageIndex + 1} / {(property.gallery?.length || 0) + 1}
                        </div>
                    </div>
                </div>

                {/* Desktop: Bento Grid (Visible on md+) */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden mb-8">
                    {/* Main Large Image - Now with Controls */}
                    <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => setCurrentImageIndex(0)}>
                        <img
                            src={[property.imageUrl, ...(property.gallery || [])][currentImageIndex] || property.imageUrl}
                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                            alt="Main View"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm text-slate-900 border border-white/50 backdrop-blur-sm">
                            {property.status === 'Sold' ? 'Sold' : (property.listingType === 'Sale' ? 'For Sale' : 'For Rent')}
                        </div>

                        {/* Desktop Controls */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const totalImages = (property.gallery?.length || 0) + 1;
                                    setCurrentImageIndex(i => i === 0 ? totalImages - 1 : i - 1);
                                }}
                                className="bg-white/90 p-2 rounded-full text-slate-900 shadow-lg hover:bg-white transition-transform hover:scale-105"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const totalImages = (property.gallery?.length || 0) + 1;
                                    setCurrentImageIndex(i => i === totalImages - 1 ? 0 : i + 1);
                                }}
                                className="bg-white/90 p-2 rounded-full text-slate-900 shadow-lg hover:bg-white transition-transform hover:scale-105"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Secondary Images - Limit to 4 max to fit grid */}
                    {(property.gallery || []).slice(0, 4).map((img: string, idx: number) => (
                        <div key={idx} className={`col-span-1 row-span-1 relative group cursor-pointer ${currentImageIndex === idx + 1 ? 'ring-4 ring-inset ring-zillow-600' : ''}`} onClick={() => setCurrentImageIndex(idx + 1)}>
                            <img src={img} className="w-full h-full object-cover hover:opacity-95 transition-opacity" alt={`View ${idx + 1}`} />
                            {/* Overlay for Last Image if there are more */}
                            {idx === 3 && (property.gallery.length > 4) && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl backdrop-blur-[2px]">
                                    +{property.gallery.length - 4} more
                                </div>
                            )}
                        </div>
                    ))}
                    {/* Fillers if no gallery */}
                    {(!property.gallery || property.gallery.length === 0) && (
                        <div className="col-span-2 row-span-2 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
                            No additional photos
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">

                        {/* HEADER: Price & Stats First */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                                        {formatPrice(property.price)}
                                        {property.ListingType === 'Rent' && <span className="text-2xl text-slate-500 font-normal">/mo</span>}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-lg md:text-xl text-slate-800 dark:text-slate-200 mb-4 font-semibold">
                                        <span className="flex items-center gap-1">
                                            <span className="font-bold">{property.bedrooms}</span> <span className="text-slate-500 font-normal">bds</span>
                                        </span>
                                        <span className="w-px h-5 bg-gray-300 dark:bg-gray-700"></span>
                                        <span className="flex items-center gap-1">
                                            <span className="font-bold">{property.bathrooms}</span> <span className="text-slate-500 font-normal">ba</span>
                                        </span>
                                        <span className="w-px h-5 bg-gray-300 dark:bg-gray-700"></span>
                                        <span className="flex items-center gap-1">
                                            <span className="font-bold">{property.sqft.toLocaleString()}</span> <span className="text-slate-500 font-normal">sqft</span>
                                        </span>
                                        <span className="w-px h-5 bg-gray-300 dark:bg-gray-700"></span>
                                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase font-bold tracking-wide dark:bg-blue-900/30 dark:text-blue-300">{property.type}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg flex items-center gap-2">
                                            <MapPin size={18} className="text-slate-400 shrink-0" />
                                            {property.address}, {property.city}, {property.state}
                                        </p>
                                        <button onClick={handleMapClick} className="text-zillow-600 hover:text-zillow-700 font-bold text-sm flex items-center gap-1 hover:underline">
                                            Show on Map
                                        </button>
                                    </div>
                                </div>

                                {/* Like / Share Buttons */}
                                <div className="flex gap-2">
                                    <button onClick={handleLike} className={`p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${isLiked ? 'text-red-500 border-red-100 bg-red-50' : 'text-zillow-600'}`}>
                                        <Heart className={isLiked ? "fill-current" : ""} size={24} />
                                    </button>
                                    {showLoginTooltip && (
                                        <div className="absolute mt-14 right-4 z-50 w-48 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl animate-fade-in pointer-events-none">
                                            <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900 transform rotate-45"></div>
                                            <p className="font-bold mb-1">Sign in to save</p>
                                        </div>
                                    )}
                                    <button className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-zillow-600 transition-colors">
                                        <Share2 size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Features - Card Style */}
                        <div className="mb-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Features</h3>
                            <div className="flex flex-wrap gap-3">
                                {property.features.map((feature: string, idx: number) => (
                                    <span key={idx} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-default flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-zillow-600" />
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* About this home (Description) - Card Style */}
                        <div className="mb-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this home</h3>
                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                                <p className="whitespace-pre-line">{property.description}</p>
                            </div>
                        </div>

                        {/* Video Section - Card Style */}
                        {property.videoUrls && property.videoUrls.length > 0 && (
                            <div className="mb-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Video Tour</h3>
                                <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
                                    <div className="aspect-video w-full relative">
                                        <video
                                            src={property.videoUrls[0]}
                                            controls
                                            className="w-full h-full object-contain"
                                            poster={property.imageUrl}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sidebar Contact (Sticky) */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-xl p-6">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                    {property.agent.avatar ? (
                                        <img src={property.agent.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt="Agent" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-zillow-600 text-white flex items-center justify-center text-xl font-bold">
                                            {property.agent.firstName[0]}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-0.5">Listing Agent</div>
                                        <div className="font-bold text-lg text-slate-900 dark:text-white hover:underline cursor-pointer" onClick={() => navigate(`/agents/${property.agent.id}`)}>
                                            {property.agent.firstName} {property.agent.lastName}
                                        </div>
                                        <div className="text-sm text-slate-500">{property.agent.agencyName}</div>
                                    </div>
                                </div>

                                {user ? (
                                    <div className="space-y-3">
                                        {/* Call Button */}
                                        <a
                                            href={`tel:${property.agent.phone}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-zillow-600 hover:bg-zillow-700 text-white rounded-md font-bold transition-colors shadow-sm"
                                        >
                                            <Phone size={20} /> Call Agent
                                        </a>

                                        {/* WhatsApp Button */}
                                        <a
                                            href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-md font-bold transition-colors shadow-sm"
                                        >
                                            <MessageCircle size={20} /> WhatsApp
                                        </a>

                                        {/* Email Button */}
                                        <a
                                            href={`mailto:${property.agent.email}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-md font-bold transition-colors border border-gray-200 dark:border-slate-700"
                                        >
                                            <Mail size={20} /> Email Agent
                                        </a>

                                        {/* Disclaimer */}
                                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-xs leading-relaxed text-red-700 dark:text-red-400">
                                            <div className="flex gap-2 mb-1 font-bold items-center">
                                                <AlertTriangle size={14} className="shrink-0" />
                                                <span>SAFETY WARNING</span>
                                            </div>
                                            Money must not be sent to any agent without physical inspection of the property and verification of the property documents.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                        <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium">Log in to contact the agent and request tours.</p>
                                        <Button onClick={() => navigate('/login')} className="w-full max-w-[200px]">Sign In</Button>
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
