
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/PropertyService';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { MapPin, Share2, CheckCircle2, Phone, MessageCircle, Mail, AlertTriangle, ChevronLeft, ChevronRight, Heart, BedDouble, Bath, Move, Star, X } from 'lucide-react';
import { agentService } from '../services/AgentService';

// Cloudinary optimization: add responsive sizing and auto-format
const optimizeCloudinaryUrl = (url: string, width: number = 800): string => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
    }
    return url;
};

export const PropertyDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();

    // Data State
    const [property, setProperty] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLoginTooltip, setShowLoginTooltip] = useState(false);

    // Rating State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    // Derived State
    const isLiked = property && user?.savedPropertyIds?.includes(property.id);

    const handleSubmitRating = async () => {
        if (!property || ratingValue === 0) return;
        try {
            const result = await agentService.rateAgent(property.agent.id, ratingValue);
            // Update local property agent rating
            setProperty((prev: any) => ({
                ...prev,
                agent: {
                    ...prev.agent,
                    rating: result.newRating
                }
            }));
            setIsRatingModalOpen(false);
            alert(`Thanks! You rated ${property.agent.firstName} ${ratingValue} stars.`);
        } catch (error) {
            console.error('Rating failed', error);
            alert('Rating failed. You might have already rated this agent?');
        }
    };

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
        <div className="min-h-screen text-slate-900 dark:text-white pb-20 bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden">
            {/* Decorative Background Blob for "Life" */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none opacity-60"></div>

            {/* Navigation / Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold text-sm transition-colors">
                    <ChevronLeft size={16} /> Back to Search
                </button>
            </div>

            {/* ERROR / LOADING HANDLED ABOVE */}

            {/* IMAGE GALLERY SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Mobile: Carousel (Visible only on small screens) */}
                <div className="md:hidden relative h-[300px] rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 mb-6 group shadow-md">
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
                            src={optimizeCloudinaryUrl([property.imageUrl, ...(property.gallery || [])][currentImageIndex], 800)}
                            className="w-full h-full object-cover transition-transform duration-500"
                            alt="Property"
                            loading="eager"
                            decoding="async"
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
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden mb-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    {/* Main Large Image - Now with Controls */}
                    <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => setCurrentImageIndex(0)}>
                        <img
                            src={optimizeCloudinaryUrl([property.imageUrl, ...(property.gallery || [])][currentImageIndex] || property.imageUrl, 800)}
                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                            alt="Main View"
                            loading="eager"
                            decoding="async"
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">

                        {/* COMPACT HEADER CARD */}
                        <div className="mb-4 relative">
                            <div className="relative bg-white dark:bg-[#121212] rounded-xl p-4 md:p-5 border border-gray-100 dark:border-gray-800 shadow-lg">
                                {/* Price Row with Likes/Share */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                                            {formatPrice(property.price)}
                                        </h1>
                                        {property.listingType === 'Rent' && <span className="text-base text-slate-400">/mo</span>}
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase">
                                            <span className={`w-1.5 h-1.5 rounded-full ${property.status === 'Sold' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                            {property.status === 'Sold' ? 'Sold' : property.listingType}
                                        </span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={handleLike} className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all ${isLiked ? 'bg-pink-50 border-pink-200 text-pink-500' : 'border-gray-200 dark:border-gray-700 text-slate-400 hover:text-pink-500 bg-white dark:bg-slate-800'}`}>
                                            <Heart className={isLiked ? "fill-current" : ""} size={16} />
                                        </button>
                                        <button className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 text-slate-400 hover:text-blue-500 bg-white dark:bg-slate-800 transition-all">
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Beds/Baths/Sqft - Compact Inline Row */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-gray-700">
                                        <div className="flex items-center gap-1.5">
                                            <BedDouble size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{property.bedrooms}</span>
                                            <span className="text-xs text-slate-400">Beds</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-200 dark:bg-gray-700"></div>
                                        <div className="flex items-center gap-1.5">
                                            <Bath size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{property.bathrooms}</span>
                                            <span className="text-xs text-slate-400">Baths</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-200 dark:bg-gray-700"></div>
                                        <div className="flex items-center gap-1.5">
                                            <Move size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{property.sqft?.toLocaleString()}</span>
                                            <span className="text-xs text-slate-400">Sqft</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Address - Compact */}
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin size={14} className="text-blue-500 shrink-0" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{property.address}, {property.city}, {property.state}</span>
                                    <button onClick={handleMapClick} className="ml-auto text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
                                        View on Map
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* About this home - Card Style */}
                        <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 md:p-5 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">About this property</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{property.description}</p>
                        </div>

                        {/* Features - Card Style */}
                        <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 md:p-5 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Features</h3>
                            <div className="flex flex-wrap gap-2">
                                {property.features.map((feature: string, idx: number) => (
                                    <span key={idx} className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                                        <CheckCircle2 size={12} className="text-green-500" />
                                        {feature}
                                    </span>
                                ))}
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
                                        <div className="text-sm text-slate-500 mb-2">{property.agent.agencyName}</div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={`${star <= Math.round(property.agent.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                />
                                            ))}
                                            <span className="text-xs text-slate-500 ml-1 font-medium">({property.agent.rating || 0})</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {user ? (
                            <div className="space-y-3">
                                {/* Rate Agent Button (New) */}
                                {user.id !== property.agent.userId && (
                                    <button
                                        onClick={() => setIsRatingModalOpen(true)}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-md font-bold transition-colors shadow-sm mb-3"
                                    >
                                        <Star size={20} className="fill-black/20" /> Rate This Agent
                                    </button>
                                )}

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

                {/* RATING MODAL */}
                {
                    isRatingModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200 relative">
                                <button
                                    onClick={() => setIsRatingModalOpen(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                                        <Star size={32} className="fill-current" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rate Agent</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        How was your experience with {property?.agent?.firstName}?
                                    </p>
                                </div>

                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRatingValue(star)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={36}
                                                className={`${star <= (hoverRating || ratingValue)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                                    } transition-colors duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    onClick={handleSubmitRating}
                                    disabled={ratingValue === 0}
                                    className="w-full"
                                >
                                    Submit Rating
                                </Button>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
};
