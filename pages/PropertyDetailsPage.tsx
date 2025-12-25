
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/PropertyService';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { MapPin, Share2, CheckCircle2, Phone, MessageCircle, Mail, AlertTriangle, ChevronLeft, ChevronRight, Heart, BedDouble, Bath, Move, Star, X, Sparkles, MoreHorizontal, Send } from 'lucide-react';
import { agentService } from '../services/AgentService';
import { PropertyCard } from '../components/PropertyCard';
import { getWhatsAppUrl } from '../utils/format';
import { ScrollReveal } from '../components/ScrollReveal';

// Default placeholder if image is missing
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

// Cloudinary optimization: add responsive sizing and auto-format
const optimizeCloudinaryUrl = (url: string, width: number = 800): string => {
    if (!url) return PLACEHOLDER_IMG;
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
    }
    return url;
};

export const PropertyDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, updateUserLocally } = useAuth();

    // Data State
    const [property, setProperty] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLoginTooltip, setShowLoginTooltip] = useState(false);
    const [suggestedProperties, setSuggestedProperties] = useState<any[]>([]);

    // Rating State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiking, setIsLiking] = useState(false); // For animation trigger
    const [isLikedInternal, setIsLikedInternal] = useState<boolean | null>(null); // For optimistic UI
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
    };

    // Meta tags and dynamic title for social sharing
    useEffect(() => {
        if (!property) return;

        const title = `${property.title} | Dwelgo.ng`;
        const description = `${property.bedrooms} Bed, ${property.bathrooms} Bath property in ${property.city}, ${property.state}. Asking Price: ${formatPrice(property.price)}`;
        const imageUrl = property.imageUrl;
        const url = window.location.href;

        // Update document title
        document.title = title;

        // Update meta tags dynamically
        const updateMeta = (selector: string, content: string) => {
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                if (selector.includes('property')) {
                    el.setAttribute('property', selector.split('"')[1]);
                } else {
                    el.setAttribute('name', selector.split('"')[1]);
                }
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        updateMeta('meta[property="og:title"]', title);
        updateMeta('meta[property="og:description"]', description);
        updateMeta('meta[property="og:image"]', imageUrl || '');
        updateMeta('meta[property="og:url"]', url);
        updateMeta('meta[name="twitter:card"]', 'summary_large_image');
        updateMeta('meta[name="description"]', description);

    }, [property]);

    // Prevent scroll jump during submission
    useEffect(() => {
        if (isSubmitting) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSubmitting]);

    // Derived State
    const isLiked = isLikedInternal !== null ? isLikedInternal : (property && user?.savedPropertyIds?.includes(property.id));

    const handleSubmitRating = async () => {
        if (!property || ratingValue === 0) return;
        setIsSubmitting(true);
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
            // alert removed in favor of a smoother experience if desired, but keeping it simple for now
        } catch (error) {
            console.error('Rating failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            setShowLoginTooltip(true);
            setTimeout(() => setShowLoginTooltip(false), 3000);
            return;
        }

        if (!property) return;

        // Optimistic UI: Update state immediately
        const wasLiked = isLiked;
        setIsLikedInternal(!wasLiked);

        // Trigger animation
        if (!wasLiked) {
            setIsLiking(true);
            setTimeout(() => setIsLiking(false), 400);
        }

        // Update local property count for instant feedback
        if (property) {
            const currentLikes = property.likes || 0;
            setProperty({
                ...property,
                likes: !wasLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)
            });
        }

        const currentSaved = user.savedPropertyIds || [];
        let newSaved;
        if (wasLiked) {
            newSaved = currentSaved.filter(id => id !== property.id);
        } else {
            newSaved = [...currentSaved, property.id];
        }

        // We don't set isSubmitting(true) here because we want it to be instant.
        // If the API fails, we'll revert.
        try {
            if (wasLiked) {
                await propertyService.unsaveProperty(property.id);
            } else {
                await propertyService.saveProperty(property.id);
            }
            // Update local context SILENTLY (no loading overlay)
            updateUserLocally({ savedPropertyIds: newSaved });
        } catch (error) {
            console.error("Failed to update like status", error);
            // Revert state if it failed
            setIsLikedInternal(wasLiked);
            setProperty(property); // property still has the old state from closure
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this property: ${property?.title}\n${window.location.href}`)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this amazing property on Dwelgo: ${property?.title}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this property: ${property?.title}`)}`,
        email: `mailto:?subject=${encodeURIComponent(`${property?.title}`)}&body=${encodeURIComponent(`Check out this property on Dwelgo.ng: ${window.location.href}`)}`
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${property?.title} | Dwelgo.ng`,
                    text: `${property?.bedrooms} Bed, ${property?.bathrooms} Bath property in ${property?.city}, ${property?.state}`,
                    url: window.location.href,
                });
            } catch (err) {
                // AbortError happens when user cancels, we ignore that
                if ((err as any).name !== 'AbortError') {
                    handleCopyLink(); // Fallback if it fails for other reasons
                }
            }
        } else {
            // Fallback for browsers that don't support Web Share API (most desktop browsers)
            handleCopyLink();
        }
    };

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await propertyService.getPropertyById(id);
                setProperty(data);

                // Fetch suggestions once property is loaded
                try {
                    const params: any = {
                        excludeId: id,
                        propertyType: data.type,
                        city: data.city,
                        state: data.state
                    };

                    // If user is logged in, prioritize their registered location if property city doesn't match
                    if (user?.city && user?.state && data.city !== user.city) {
                        // We could potentially mix recommendations here
                    }

                    const suggestions = await propertyService.getSuggestedProperties(params);
                    // Shuffle suggestions to make them feel dynamic on every visit
                    const shuffledSuggestions = [...suggestions].sort(() => Math.random() - 0.5);
                    setSuggestedProperties(shuffledSuggestions);
                } catch (sErr) {
                    console.error('Failed to load suggestions', sErr);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
        window.scrollTo(0, 0);
    }, [id, user?.city, user?.state]);

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


    const handleMapClick = () => {
        if (property.latitude && property.longitude) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address + ' ' + property.city)}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen text-slate-900 dark:text-white pb-20 bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden">
            {/* Global Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-zillow-600 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-zillow-600">
                            <Star className="animate-pulse" size={32} />
                        </div>
                    </div>
                    <p className="mt-8 text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">Processing <span className="text-zillow-600">Action</span></p>
                </div>
            )}

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
                <ScrollReveal animation="fade-in-up">
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
                </ScrollReveal>

                {/* Desktop: Bento Grid (Visible on md+) */}
                <ScrollReveal animation="fade-in-down">
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
                </ScrollReveal>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">

                        {/* COMPACT HEADER CARD */}
                        <ScrollReveal animation="fade-in-left">
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
                                        <div className="flex gap-1.5 relative">
                                            {/* Login Tooltip */}
                                            {showLoginTooltip && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-md shadow-lg whitespace-nowrap z-20 animate-fade-in-up">
                                                    Sign up to like properties
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                                </div>
                                            )}

                                            <button
                                                onClick={handleLike}
                                                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all ${isLiked ? 'bg-pink-50 border-pink-200 text-pink-500' : 'border-gray-200 dark:border-gray-700 text-slate-400 hover:text-pink-500 bg-white dark:bg-slate-800'} ${isLiking ? 'animate-heart-pop' : ''}`}
                                            >
                                                <Heart className={isLiked ? "fill-current" : ""} size={16} />
                                            </button>
                                            <button
                                                onClick={() => setIsShareModalOpen(true)}
                                                className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 text-slate-400 hover:text-blue-500 bg-white dark:bg-slate-800 transition-all"
                                            >
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
                                    <div className="flex items-center gap-2 text-sm mb-4">
                                        <MapPin size={14} className="text-blue-500 shrink-0" />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{property.address}, {property.city}, {property.state}</span>
                                        <button onClick={handleMapClick} className="ml-auto text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
                                            View on Map
                                        </button>
                                    </div>

                                    {/* Stats Row - Zillow Style */}
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                                        <span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {Math.max(1, Math.floor((new Date().getTime() - new Date(property.addedAt).getTime()) / (1000 * 3600 * 24)))}
                                            </span> days on Dwelgo
                                        </span>
                                        <div className="w-px h-3 bg-gray-200 dark:bg-gray-700"></div>
                                        <span>
                                            <span className="font-bold text-slate-900 dark:text-white">{property.views?.toLocaleString() || 0}</span> views
                                        </span>
                                        <div className="w-px h-3 bg-gray-200 dark:bg-gray-700"></div>
                                        <span>
                                            <span className="font-bold text-slate-900 dark:text-white">{property.likes || 0}</span> likes
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* About this home - Card Style */}
                        <ScrollReveal animation="fade-in-up">
                            <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 md:p-5 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">About this property</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{property.description}</p>
                            </div>
                        </ScrollReveal>

                        {/* Features - Card Style */}
                        <ScrollReveal animation="fade-in-up">
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
                        </ScrollReveal>

                        {/* Video Section - Card Style */}
                        {property.videoUrls && property.videoUrls.length > 0 && (
                            <ScrollReveal animation="fade-in-up">
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
                            </ScrollReveal>
                        )}

                    </div>

                    {/* Sidebar Contact (Sticky) */}
                    <ScrollReveal animation="fade-in-right" className="lg:w-1/3">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-xl p-6">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                    <div className="cursor-pointer" onClick={() => navigate(`/agents/${property.agent.id}`)}>
                                        {property.agent.avatar ? (
                                            <img src={property.agent.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt="Agent" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-zillow-600 text-white flex items-center justify-center text-xl font-bold">
                                                {property.agent.firstName[0]}
                                            </div>
                                        )}
                                    </div>
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
                                            <span className="text-xs text-slate-500 ml-1 font-medium">({Number(property.agent.rating || 0).toFixed(1)})</span>
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

                                {/* Phone Button */}
                                <a
                                    href={`tel:${property.agent.phone}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-zillow-600 hover:bg-zillow-700 text-white rounded-md font-bold transition-colors shadow-sm"
                                >
                                    <Phone size={20} /> Call Agent
                                </a>


                                {/* WhatsApp Button */}
                                <a
                                    href={getWhatsAppUrl(property.agent.whatsapp || property.agent.phone, `Hi, I'm interested in "${property.title}" listed on Dwelgo.ng`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-md font-bold transition-colors shadow-sm"
                                >
                                    <MessageCircle size={20} /> WhatsApp
                                </a>


                                {/* Email Button */}
                                <a
                                    href={`mailto:${property.agent.email}`}
                                    className="hidden sm:flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-md font-bold transition-colors border border-gray-200 dark:border-slate-700"
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
                    </ScrollReveal>
                </div>

                {/* SUGGESTED PROPERTIES SECTION */}
                {suggestedProperties.length > 0 && (
                    <ScrollReveal animation="fade-in-up">
                        <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="text-yellow-500" size={24} />
                                    Suggested Properties
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {suggestedProperties.slice(0, 4).map((prop, idx) => (
                                    <div key={prop.id} className={idx === 3 ? 'hidden sm:block' : ''}>
                                        <PropertyCard property={prop} />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 text-center">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/properties')}
                                    className="w-full sm:w-auto px-12"
                                >
                                    View All Properties
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* RATING MODAL */}
                {isRatingModalOpen && (
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
                )}
            </div>

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-zoom-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Share Property</h3>
                            <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366] transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm hover:shadow-md">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.41 0 .01 5.399 0 12.039c0 2.123.554 4.197 1.608 6.023L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.639 0 12.039-5.402 12.042-12.041a11.83 11.83 0 00-3.535-8.498" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">WhatsApp</span>
                            </a>
                            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-black/10 dark:bg-white/10 rounded-2xl flex items-center justify-center text-black dark:text-white transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-sm hover:shadow-md">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">X</span>
                            </a>
                            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-[#1877F2]/10 rounded-2xl flex items-center justify-center text-[#1877F2] transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm hover:shadow-md">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">Facebook</span>
                            </a>
                            <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-[#0088cc]/10 rounded-2xl flex items-center justify-center text-[#0088cc] transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-sm hover:shadow-md">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                                        <path d="M11.944 0C5.346 0 0 5.346 0 11.944s5.346 11.944 11.944 11.944 11.944-5.346 11.944-11.944S18.542 0 11.944 0zm5.812 8.356c-.195 1.543-.884 5.356-1.258 7.373-.158.855-.472 1.141-.776 1.169-.661.061-1.162-.439-1.802-.859-1.002-.657-1.568-1.066-2.541-1.706-1.124-.74-0.395-1.146.245-1.809.168-.173 3.078-2.822 3.134-3.058.007-.03.013-.142-.053-.2-.066-.058-.163-.038-.233-.022-.099.022-1.684 1.071-4.755 3.141-.45.31-.856.462-1.218.455-.399-.009-1.168-.225-1.739-.41-.703-.227-1.261-.347-1.213-.733.025-.201.302-.408.831-.621 3.257-1.417 5.429-2.353 6.516-2.809 3.102-1.303 3.746-1.53 4.166-1.538.092-.002.298.021.432.13.113.092.144.215.151.31.007.094.013.298-.013.431z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">Telegram</span>
                            </a>
                            <a href={shareLinks.email} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center text-amber-600 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm hover:shadow-md">
                                    <Mail size={28} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">Email</span>
                            </a>
                            <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-sm hover:shadow-md">
                                    <MoreHorizontal size={28} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">More</span>
                            </button>
                            <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                                <div className={`w-14 h-14 ${copied ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm hover:shadow-md`}>
                                    {copied ? <CheckCircle2 size={28} /> : <Share2 size={24} />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">{copied ? 'Copied' : 'Copy Link'}</span>
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between gap-3 border border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-500 truncate flex-1 font-medium">{window.location.href}</span>
                            <button onClick={handleCopyLink} className="text-xs font-bold text-zillow-600 hover:text-zillow-700 whitespace-nowrap px-2">
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
