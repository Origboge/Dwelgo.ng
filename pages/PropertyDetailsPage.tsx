
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



            {/* NEW IMAGE LAYOUT: Main Image Top (Carousel), Thumbnails Below */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Main Large Image Carousel */}
                <div
                    className="w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden shadow-sm mb-4 relative group bg-gray-100 dark:bg-slate-800"
                    onTouchStart={(e) => {
                        const touch = e.touches[0];
                        e.currentTarget.dataset.touchStartX = touch.clientX.toString();
                    }}
                    onTouchEnd={(e) => {
                        const touchStartX = parseFloat(e.currentTarget.dataset.touchStartX || '0');
                        const touchEndX = e.changedTouches[0].clientX;
                        const diff = touchStartX - touchEndX;
                        const threshold = 50; // min distance for swipe

                        if (Math.abs(diff) > threshold) {
                            const totalImages = (property.gallery?.length || 0) + 1;
                            if (diff > 0) {
                                // Swipe Left -> Next
                                setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
                            } else {
                                // Swipe Right -> Prev
                                setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
                            }
                        }
                    }}
                >
                    <img
                        src={[property.imageUrl, ...(property.gallery || [])][currentImageIndex]}
                        className="w-full h-full object-cover transition-all duration-500"
                        alt="Property View"
                    />

                    {/* Carousel Controls - Always visible on mobile, hover on desktop */}
                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const totalImages = (property.gallery?.length || 0) + 1;
                                setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
                            }}
                            className="bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 backdrop-blur-sm pointer-events-auto"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const totalImages = (property.gallery?.length || 0) + 1;
                                setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
                            }}
                            className="bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 backdrop-blur-sm pointer-events-auto"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                        {currentImageIndex + 1} / {(property.gallery?.length || 0) + 1}
                    </div>
                </div>

                {/* Row of Additional Images (Thumbnails) */}
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                    {[property.imageUrl, ...(property.gallery || [])].map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`shrink-0 w-64 h-40 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 snap-start bg-gray-100 dark:bg-slate-800 border-2 transition-all shadow-sm ${currentImageIndex === idx ? 'border-zillow-600 ring-2 ring-zillow-600/20' : 'border-transparent'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                        {property.type !== 'Land' && property.listingType !== 'Land' ? (
                                            <>
                                                <span className="font-bold">{property.bedrooms} <span className="font-normal text-slate-500">{property.bedrooms === 1 ? 'bed' : 'beds'}</span></span>
                                                <span className="font-bold">{property.bathrooms} <span className="font-normal text-slate-500">{property.bathrooms === 1 ? 'bath' : 'baths'}</span></span>
                                                <span className="font-bold">{property.sqft} <span className="font-normal text-slate-500">sqft</span></span>
                                            </>
                                        ) : (
                                            <>
                                                {property.plots && property.plots > 0 && (
                                                    <span className="font-bold">{property.plots} <span className="font-normal text-slate-500">Plots</span></span>
                                                )}
                                                <span className="font-bold">{property.sqft} <span className="font-normal text-slate-500">sqm</span></span>
                                            </>
                                        )}
                                        <span className="text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase tracking-wide font-bold">{property.type}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-xl font-medium mb-4 flex items-center gap-2">
                                        <MapPin size={18} className="text-slate-400" />
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

                                <div className="flex gap-3 relative">
                                    <Button
                                        variant="ghost"
                                        className={`text-zillow-600 hover:bg-zillow-50 ${isLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : ''}`}
                                        onClick={handleLike}
                                    >
                                        <Heart size={24} className={isLiked ? "fill-current" : ""} />
                                    </Button>
                                    {showLoginTooltip && (
                                        <div className="absolute top-12 right-0 z-50 w-48 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl animate-fade-in pointer-events-none">
                                            <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900 transform rotate-45"></div>
                                            <p className="font-bold mb-1">Sign in to save</p>
                                            <p className="text-slate-300">Create an account to save your favorite homes.</p>
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>

                        <div className="flex gap-2 mt-4">
                            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mt-1.5"></span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {property.listingType === 'Sale' ? 'For Sale' : 'For Rent'}
                                {property.status !== 'Active' && property.status !== 'Available' && ` - ${property.status}`}
                            </span>
                        </div>
                        {/* Video Section - Moved Here */}
                        {property.videoUrls && property.videoUrls.length > 0 && (
                            <div className="mb-8 p-1 bg-black rounded-xl overflow-hidden shadow-lg">
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
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Overview</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {property.description}
                            </p>
                        </div>

                        {/* Features */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 bg-gray-50 dark:bg-slate-900 p-6 rounded-lg">
                                {property.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                                        <CheckCircle2 size={18} className="text-zillow-600 shrink-0 mt-0.5" />
                                        <span className="break-words leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>
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
    );
};
