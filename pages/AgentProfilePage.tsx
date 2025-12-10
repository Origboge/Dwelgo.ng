import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { PROPERTY_TYPES } from '../constants';
import { Property } from '../types';
import { propertyService } from '../services/PropertyService';
import { agentService } from '../services/AgentService';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import {
    Phone, Mail, MapPin, Award, Star, Globe, Linkedin, Twitter, Instagram, ShieldCheck,
    ArrowLeft, Building2, Plus, X, UploadCloud, Lock, Image as ImageIcon,
    DollarSign, Home, CheckSquare, Maximize, BarChart3, Users, MousePointerClick, Crosshair, MessageCircle, Camera,
    CheckCircle2, AlertTriangle, Edit
} from 'lucide-react';
import { Agent } from '../types';
import { NIGERIA_LOCATIONS } from '../nigeriaLocations';

interface AgentProfilePageProps {
    agentId?: string; // Optional prop to force a specific agent ID (for use in Dashboard)
}

export const AgentProfilePage: React.FC<AgentProfilePageProps> = ({ agentId: propAgentId }) => {
    const { id: paramId } = useParams<{ id: string }>();
    const { user, updateProfile } = useAuth();

    // Determine the ID to use: Prop > URL Param > User ID (if user is agent)
    // If used in Dashboard, propAgentId will be passed.
    // If used via route /agents/:id, paramId will be present.
    // If no ID found, fallback to logged-in user ID if they are an agent.
    const id = propAgentId || paramId || (user?.role === 'agent' ? user.id : undefined);

    const navigate = useNavigate();

    // Data State
    const [agent, setAgent] = useState<Agent | undefined>(undefined);
    const [agentProperties, setAgentProperties] = useState<Property[]>([]);
    const [likedProperties, setLikedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    });

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ visible: boolean; propertyId: string | null }>({
        visible: false,
        propertyId: null
    });

    // Helper to show toast
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    // Check for query param ?tab=likes
    const locationInfo = useLocation();
    const queryParams = new URLSearchParams(locationInfo.search);
    const initialTab = queryParams.get('tab') === 'likes' ? 'likes' : 'listings';
    const [activeTab, setActiveTab] = useState<'listings' | 'likes'>(initialTab);

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        bio: user?.bio || '',
        licenseNumber: user?.licenseNumber || '',
        experience: user?.experience || '',
        specialties: user?.specialties?.join(', ') || '',
        location: user?.location || 'Lagos, Nigeria'
    });

    // Listing Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        priceFrequency: 'Year',
        address: '',
        city: '',
        state: '',
        type: 'House',
        listingType: 'Sale',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        plots: '',
        featuresList: [] as string[],
        imageUrl: '',
        latitude: '',
        longitude: ''
    });

    const [currentFeature, setCurrentFeature] = useState('');
    const [mediaPreviews, setMediaPreviews] = useState<{ images: string[], video: string | null }>({
        images: [],
        video: null
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Check if the current user is the owner of this agent profile
    // agent.userId might be an object (populated) or a string (ID) depending on API response
    const agentUserId = typeof agent?.userId === 'object' ? (agent.userId as any)._id || (agent.userId as any).id : agent?.userId;
    const isOwner = user?.role === 'agent' && user?.id === agentUserId;

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // 1. Fetch Agent
                const agentData = await agentService.getAgentById(id);
                setAgent(agentData);

                if (agentData) {
                    // 2. Fetch Agent's Properties
                    const props = await propertyService.getAgentProperties(agentData.id);
                    setAgentProperties(props);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, refreshTrigger]);

    // Fetch Likes when tab is active
    useEffect(() => {
        const fetchLikes = async () => {
            if (activeTab === 'likes' && user?.savedPropertyIds?.length) {
                try {
                    const promises = user.savedPropertyIds.map(pid => propertyService.getPropertyById(pid));
                    const results = await Promise.all(promises);
                    setLikedProperties(results.filter(p => p !== undefined) as Property[]);
                } catch (err) {
                    console.error('Failed to fetch likes', err);
                }
            }
        };
        if (user) fetchLikes();
    }, [activeTab, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'state') {
            // Reset city when state changes
            setFormData(prev => ({ ...prev, state: value, city: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAddFeature = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (currentFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                featuresList: [...(prev.featuresList || []), currentFeature.trim()]
            }));
            setCurrentFeature('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            featuresList: prev.featuresList.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            if (files.length + mediaPreviews.images.length > 4) {
                showToast("You can only select up to 4 photos.", 'error');
                e.target.value = '';
                return;
            }
            const oversized = Array.from(files).some((file: any) => file.size > 500 * 1024);
            if (oversized) {
                showToast("Some images are too large. Please select images under 500KB.", 'error');
                e.target.value = '';
                return;
            }
            Array.from(files).forEach((file: any) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreviews(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
                };
                reader.readAsDataURL(file as Blob);
            });
            if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("Video file is too large. Please select a video under 2MB.", 'error');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreviews(prev => ({ ...prev, video: reader.result as string }));
            };
            reader.readAsDataURL(file);
            if (errors.video) setErrors(prev => ({ ...prev, video: '' }));
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", 'error');
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
                showToast("Unable to retrieve your location", 'error');
                setIsLocating(false);
            }
        );
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.title) newErrors.title = "Property Title is required";
        if (!formData.price) newErrors.price = "Price is required";
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";

        if (formData.listingType === 'Land') {
            if (!formData.sqft) newErrors.sqft = "Total Area is required";
            if (!formData.plots) newErrors.plots = "Number of Plots is required";
        }

        if (mediaPreviews.images.length === 0) newErrors.images = "At least one image is required";
        if (!mediaPreviews.video) newErrors.video = "A video tour is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePublish = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const newProperty: Property = {
            id: editingId || `p-${Date.now()}`,
            title: formData.title,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            price: Number(formData.price),
            type: formData.type as any,
            listingType: formData.listingType as any,
            bedrooms: Number(formData.bedrooms) || 0,
            bathrooms: Number(formData.bathrooms) || 0,
            sqft: Number(formData.sqft),
            imageUrl: mediaPreviews.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
            gallery: mediaPreviews.images,
            videoUrls: mediaPreviews.video ? [mediaPreviews.video] : [],
            agent: agent!,
            features: formData.featuresList && formData.featuresList.length > 0
                ? formData.featuresList
                : formData.description.split('.').map(s => s.trim()).filter(s => s.length > 5).slice(0, 5),
            isFeatured: false,
            status: 'Available',
            description: formData.description,
            addedAt: new Date().toISOString().split('T')[0],
            latitude: Number(formData.latitude) || undefined,
            longitude: Number(formData.longitude) || undefined,
            priceFrequency: formData.priceFrequency as any || 'Year',
            plots: Number(formData.plots) || 0
        };

        setTimeout(async () => {
            try {
                if (editingId) {
                    await propertyService.updateProperty(newProperty.id, newProperty);
                } else {
                    await propertyService.createProperty(newProperty);
                }
                setIsSubmitting(false);
                setShowAddForm(false);
                setShowSuccessModal(true);
                setMediaPreviews({ images: [], video: null });
                setFormData({
                    title: '', description: '', price: '', priceFrequency: 'Year', address: '', city: '', state: '',
                    type: 'House', listingType: 'Sale', bedrooms: '', bathrooms: '', sqft: '', plots: '',
                    featuresList: [], imageUrl: '', latitude: '', longitude: ''
                });
                setEditingId(null);
                setRefreshTrigger(prev => prev + 1);
            } catch (error: any) {
                console.error(error);
                setIsSubmitting(false);
                if (error.name === 'QuotaExceededError' || error.message?.includes('QuotaExceededError')) {
                    showToast("Storage Full! You have uploaded too many high-resolution images.", 'error');
                } else {
                    showToast(error.response?.data?.message || "Failed to save property. Please try again.", 'error');
                }
            }
        }, 1000);
    };

    // Avatar File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("Image is too large. Please select an image under 2MB.", 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                const previousAvatar = agent?.avatar;

                // Optimistic update
                if (agent) setAgent({ ...agent, avatar: result });

                try {
                    await updateProfile({ avatar: result });
                    showToast("Profile picture updated!", 'success');
                } catch (error) {
                    console.error("Failed to update profile", error);
                    // Revert optimistic update
                    if (agent) setAgent({ ...agent, avatar: previousAvatar || '' });
                    showToast("Failed to save profile picture. Please try again.", 'error');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zillow-600"></div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col bg-white text-slate-900">
                <h2 className="text-3xl font-bold mb-4">Agent Not Found</h2>
                <Link to="/agents"><Button variant="outline">Back to Directory</Button></Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-900 bg-gray-50 dark:bg-[#0a0a0a]">


            {/* Header / Cover Image Section */}
            <div className="relative">
                {/* Cover Image */}
                <div className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden">
                    <div className="h-48 md:h-64 w-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80')` }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                    </div>
                </div>

                {/* Profile Card Container - Overlapping Cover */}
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 mb-12">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            {agent.avatar ? (
                                <img
                                    src={agent.avatar}
                                    alt={agent.firstName}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md bg-gray-200"
                                />
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-zillow-600 text-white flex items-center justify-center text-4xl font-bold tracking-wider">
                                    {getInitials(agent.firstName, agent.lastName)}
                                </div>
                            )}

                            {isOwner && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-10"
                                    >
                                        <Camera size={24} />
                                    </button>
                                </>
                            )}
                            <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold px-2 py-1 rounded-full text-xs shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1 z-20">
                                <Star size={12} className="fill-yellow-500 text-yellow-500" /> {agent.rating}
                            </div>
                        </div>

                        {isOwner && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                >
                                    <Camera size={24} />
                                </button>
                            </>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white text-slate-900 font-bold px-2 py-1 rounded-full text-xs shadow border border-gray-200 flex items-center gap-1">
                            <Star size={10} className="fill-yellow-500 text-yellow-500" /> {agent.rating} ({agent.ratingCount || 12} reviews)
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">{agent.firstName} {agent.lastName}</h1>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium mb-2 text-lg">{agent.agencyName}</p>
                                </div>
                                {isOwner && (
                                    <div className="bg-green-100 text-green-800 px-5 py-2 rounded-full text-sm font-bold border border-green-200">
                                        View as: Owner
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6 mt-3 font-medium">
                                <span className="flex items-center gap-1"><MapPin size={16} className="text-zillow-600" /> {agent.location || user?.location || 'Lagos, Nigeria'}</span>
                                {agent.experience && <span className="flex items-center gap-1"><Award size={16} className="text-zillow-600" /> {agent.experience} Years Experience</span>}
                                {agent.licenseNumber && <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-zillow-600" /> Lic: {agent.licenseNumber}</span>}
                            </div>

                            {!isOwner && (
                                user ? (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3">Contact Details</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Phone size={16} />
                                                </div>
                                                <span className="font-medium selection:bg-green-100">{agent.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Mail size={16} />
                                                </div>
                                                <span className="font-medium selection:bg-blue-100">{agent.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                    <MessageCircle size={16} />
                                                </div>
                                                <span className="font-medium">WhatsApp Available</span>
                                            </div>
                                        </div>
                                        <a href={`tel:${agent.phone}`} className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-zillow-600 hover:bg-zillow-700 text-white rounded-md font-bold transition-colors">
                                            <Phone size={18} /> Call Agent
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                        <Lock className="mx-auto text-slate-400 mb-2" size={32} />
                                        <p className="font-bold text-slate-900 dark:text-white mb-1">Contact Info Hidden</p>
                                        <p className="text-sm text-slate-500 mb-4">Sign in to view this agent's phone number and email.</p>
                                        <Button variant="primary" className="w-full justify-center" onClick={() => navigate('/login')}>
                                            Sign In to View
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {
                showSuccessModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center transform transition-all scale-100 border border-gray-100 dark:border-gray-800">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckSquare className="text-green-600 dark:text-green-400" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Listing Published!</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">
                                Your property has been successfully uploaded and is now live on Dwelgo.ng.
                            </p>
                            <div className="space-y-3">
                                <Button variant="primary" className="w-full py-3 shadow-lg shadow-blue-200 dark:shadow-none" onClick={() => setShowSuccessModal(false)}>
                                    Continue to Dashboard
                                </Button>
                                <Button variant="outline" className="w-full py-3" onClick={() => { setShowSuccessModal(false); navigate('/'); }}>
                                    View Live Listing
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Toast Notification */}
            {
                toast.visible && (
                    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl animate-slide-down ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        <span className="font-bold">{toast.message}</span>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteModal.visible && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-gray-100 dark:border-gray-800 transform scale-100 transition-all">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-red-600 dark:text-red-500" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Listing?</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">
                                Are you sure you want to delete this property? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 py-2.5 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    onClick={() => setDeleteModal({ visible: false, propertyId: null })}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 border-none text-white shadow-lg shadow-red-200 dark:shadow-none"
                                    onClick={async () => {
                                        if (deleteModal.propertyId) {
                                            try {
                                                await propertyService.deleteProperty(deleteModal.propertyId);
                                                setRefreshTrigger(prev => prev + 1);
                                                showToast('Property deleted successfully', 'success');
                                                setDeleteModal({ visible: false, propertyId: null });
                                            } catch (err) {
                                                console.error(err);
                                                showToast('Failed to delete property', 'error');
                                            }
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 mb-8 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                                Professional Info
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-2">
                                        <Users size={14} /> About
                                    </p>
                                    {isEditingProfile ? (
                                        <textarea
                                            value={profileForm.bio}
                                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-zillow-600 outline-none"
                                            rows={5}
                                        />
                                    ) : (
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                            {user?.bio || agent.bio || "Dedicated real estate professional committed to helping clients achieve their property goals."}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-2">
                                        <Award size={14} /> Specialties
                                    </p>
                                    {isEditingProfile ? (
                                        <input
                                            value={profileForm.specialties}
                                            onChange={(e) => setProfileForm({ ...profileForm, specialties: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-zillow-600 outline-none"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {(user?.specialties?.join(', ') || "Buyer's Agent, Listing Agent, Relocation, Consulting").split(',').map((tag, i) => (
                                                <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-2">
                                        <ShieldCheck size={14} /> License
                                    </p>
                                    {isEditingProfile ? (
                                        <input
                                            value={profileForm.licenseNumber}
                                            onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-zillow-600 outline-none"
                                        />
                                    ) : (
                                        <p className="text-slate-700 dark:text-slate-300 text-sm font-mono bg-gray-50 dark:bg-slate-950 inline-block px-3 py-1 rounded border border-gray-200 dark:border-gray-800">
                                            {user?.licenseNumber || agent.licenseNumber || "N/A"}
                                        </p>
                                    )}
                                </div>
                                {isEditingProfile && (
                                    <div>
                                        <p className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-wider">Experience (Years)</p>
                                        <input
                                            type="number"
                                            value={profileForm.experience}
                                            onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-zillow-600 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            if (isEditingProfile) {
                                                updateProfile({
                                                    bio: profileForm.bio,
                                                    licenseNumber: profileForm.licenseNumber,
                                                    experience: Number(profileForm.experience),
                                                    specialties: profileForm.specialties.split(',').map(s => s.trim()),
                                                    location: profileForm.location
                                                });
                                                setIsEditingProfile(false);
                                            } else {
                                                setProfileForm({
                                                    bio: user?.bio || agent.bio || '',
                                                    licenseNumber: user?.licenseNumber || agent.licenseNumber || '',
                                                    experience: user?.experience || agent.experience || '',
                                                    specialties: user?.specialties?.join(', ') || "Buyer's Agent, Listing Agent",
                                                    location: user?.location || 'Lagos, Nigeria'
                                                });
                                                setIsEditingProfile(true);
                                            }
                                        }}
                                        className={`w-full ${isEditingProfile ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'} px-5 py-3 rounded-lg text-sm font-bold border border-transparent hover:opacity-90 transition-colors shadow-sm flex items-center justify-center gap-2`}
                                    >
                                        {isEditingProfile ? <CheckCircle2 size={16} /> : <Edit size={16} />}
                                        {isEditingProfile ? 'Save Changes' : 'Edit Info'}
                                    </button>
                                </div>
                            )}
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-6 text-slate-400 justify-center">
                                <Linkedin className="cursor-pointer hover:text-zillow-600 transition-colors" size={20} />
                                <Twitter className="cursor-pointer hover:text-zillow-600 transition-colors" size={20} />
                                <Instagram className="cursor-pointer hover:text-zillow-600 transition-colors" size={20} />
                                <Globe className="cursor-pointer hover:text-zillow-600 transition-colors" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        {isOwner && (
                            <div className="mb-10 animate-fade-in">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-900 text-white rounded-xl p-10 shadow-2xl mb-8 relative overflow-hidden ring-1 ring-white/10">
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-4xl font-bold mb-3 tracking-tight">Realtor Dashboard</h3>
                                            <p className="text-blue-100 text-lg opacity-90 max-w-md">Manage your listings, track your performance, and grow your real estate business.</p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            className="bg-white text-indigo-900 hover:bg-blue-50 border-none shadow-xl font-bold px-8 py-4 text-base transition-transform hover:scale-105 active:scale-95"
                                            onClick={() => setShowAddForm(!showAddForm)}
                                        >
                                            {showAddForm ? (
                                                <><X size={20} className="mr-2" /> Cancel</>
                                            ) : (
                                                <><Plus size={20} className="mr-2" /> Post New Property</>
                                            )}
                                        </Button>
                                    </div>
                                    <Building2 size={240} className="absolute -right-12 -bottom-16 text-white/5 rotate-12" />
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-8">
                                    <button
                                        onClick={() => setActiveTab('listings')}
                                        className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === 'listings' ? 'text-zillow-600 dark:text-zillow-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                    >
                                        My Listings
                                        {activeTab === 'listings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zillow-600 dark:bg-zillow-400"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('likes')}
                                        className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === 'listings' ? 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200' : 'text-zillow-600 dark:text-zillow-400'}`}
                                    >
                                        My Likes
                                        {activeTab === 'likes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zillow-600 dark:bg-zillow-400"></div>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isOwner && activeTab === 'likes' ? (
                            <div className="space-y-6">
                                {likedProperties.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {likedProperties.map(property => (
                                            <PropertyCard key={property.id} property={property} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-slate-500 mb-4">You haven't liked any properties yet.</p>
                                        <Button variant="primary" onClick={() => window.location.href = '#/properties'}>
                                            Browse Properties
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {showAddForm && (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 animate-slide-up shadow-xl mb-8 relative">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-zillow-600 rounded-t-lg"></div>
                                        <h4 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center">
                                            <Home className="mr-2 text-zillow-600" size={24} />
                                            {editingId ? 'Edit Listing Details' : 'New Listing Details'}
                                        </h4>
                                        <form onSubmit={handlePublish}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                <div className="md:col-span-2">
                                                    <Input label="Property Title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Luxury Waterfront Villa" error={errors.title} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Listing Type</label>
                                                        <select name="listingType" value={formData.listingType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-shadow focus:ring-1 focus:ring-zillow-600">
                                                            <option value="Sale">For Sale</option>
                                                            <option value="Rent">For Rent</option>
                                                            <option value="Land">Land</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Property Type</label>
                                                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-shadow focus:ring-1 focus:ring-zillow-600">
                                                            <option value="House">House</option>
                                                            <option value="Apartment">Apartment</option>
                                                            <option value="Condo">Condo</option>
                                                            <option value="Villa">Villa</option>
                                                            <option value="Land">Land / Plot</option>
                                                            <option value="Commercial">Commercial</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Price (NGN)" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g. 150000000" type="number" icon={<span className="text-gray-500 font-bold">₦</span>} error={errors.price} />
                                                    {formData.listingType === 'Rent' && (
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Frequency</label>
                                                            <select name="priceFrequency" value={formData.priceFrequency} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-shadow focus:ring-1 focus:ring-zillow-600">
                                                                <option value="Year">Per Year</option>
                                                                <option value="Month">Per Month</option>
                                                                <option value="Night">Per Night</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg mb-8 border border-gray-100 dark:border-gray-800">
                                                <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase">Property Specs</h5>
                                                {(formData.listingType !== 'Land') && (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <Input label="Beds" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} type="number" />
                                                        <Input label="Baths" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} type="number" />
                                                        <Input label="Sqft" name="sqft" value={formData.sqft} onChange={handleInputChange} type="number" />
                                                    </div>
                                                )}
                                                {(formData.listingType === 'Land') && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Input label="Total Area (Sqft/Sqm)" name="sqft" value={formData.sqft} onChange={handleInputChange} type="number" error={errors.sqft} />
                                                        <Input label="Number of Plots" name="plots" value={formData.plots} onChange={handleInputChange} type="number" error={errors.plots} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg mb-8 border border-gray-100 dark:border-gray-800">
                                                <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase">Media Uploads</h5>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Photos (Max 4)</label>
                                                    <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative ${errors.images ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-700'}`}>
                                                        <input type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                                        <ImageIcon className={`mx-auto mb-2 ${errors.images ? 'text-red-500' : 'text-slate-400'}`} size={32} />
                                                        <p className={`text-sm ${errors.images ? 'text-red-600' : 'text-slate-500'}`}>Drag & drop or click to upload photos</p>
                                                    </div>
                                                    {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                                                    {mediaPreviews.images.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-4 gap-2">
                                                            {mediaPreviews.images.map((img, idx) => (
                                                                <div key={idx} className="relative aspect-square rounded overflow-hidden border border-gray-200">
                                                                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Video Tour (Min 1 required)</label>
                                                    <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative ${errors.video ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-700'}`}>
                                                        <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleVideoUpload} />
                                                        <UploadCloud className={`mx-auto mb-2 ${errors.video ? 'text-red-500' : 'text-slate-400'}`} size={32} />
                                                        <p className={`text-sm ${errors.video ? 'text-red-600' : 'text-slate-500'}`}>Upload a video tour</p>
                                                    </div>
                                                    {errors.video && <p className="text-red-500 text-xs mt-1">{errors.video}</p>}
                                                    {mediaPreviews.video && (
                                                        <div className="mt-4">
                                                            <video src={mediaPreviews.video} controls className="w-full h-48 rounded bg-black" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                <div className="md:col-span-2">
                                                    <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street Address" icon={<MapPin size={18} />} error={errors.address} />
                                                </div>

                                                {/* State Selection */}
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">State</label>
                                                    <select
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-3 rounded-md border ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-shadow focus:ring-1 focus:ring-zillow-600`}
                                                    >
                                                        <option value="">Select State</option>
                                                        {Object.keys(NIGERIA_LOCATIONS).sort().map(state => (
                                                            <option key={state} value={state}>{state}</option>
                                                        ))}
                                                    </select>
                                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                                </div>

                                                {/* City/LGA Selection */}
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">City / LGA</label>
                                                    <select
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        disabled={!formData.state}
                                                        className={`w-full px-4 py-3 rounded-md border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-shadow focus:ring-1 focus:ring-zillow-600 ${!formData.state ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="">Select City / LGA</option>
                                                        {formData.state && NIGERIA_LOCATIONS[formData.state]?.sort().map(lga => (
                                                            <option key={lga} value={lga}>{lga}</option>
                                                        ))}
                                                    </select>
                                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                                </div>

                                                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/10 p-4 md:p-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
                                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <MapPin className="text-zillow-600" size={32} />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Property Location</h3>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                                                        Pinning your location helps buyers find your property accurately on the map.
                                                        Stand at the property location and click the button below.
                                                    </p>

                                                    {formData.latitude && formData.longitude ? (
                                                        <div className="animate-fade-in bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-900/50 inline-block w-full max-w-sm relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                                                            <div className="flex items-center gap-3 justify-center mb-3 text-green-700 dark:text-green-400 font-bold text-lg">
                                                                <CheckCircle2 size={24} className="fill-green-100 dark:fill-green-900/30" />
                                                                Location Pinned
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-6 bg-gray-50 dark:bg-slate-900/50 py-2 rounded border border-gray-100 dark:border-gray-800">
                                                                Lat: {Number(formData.latitude).toFixed(6)} • Long: {Number(formData.longitude).toFixed(6)}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleGetCurrentLocation}
                                                                disabled={isLocating}
                                                                className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                                                            >
                                                                {isLocating ? 'Updating...' : 'Update Location'}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="primary"
                                                            onClick={handleGetCurrentLocation}
                                                            disabled={isLocating}
                                                            className="px-6 py-3 md:px-10 md:py-4 shadow-xl shadow-blue-200 dark:shadow-none text-base md:text-lg rounded-full transition-transform hover:scale-105 active:scale-95 w-full md:w-auto"
                                                        >
                                                            {isLocating ? (
                                                                <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Locating...</span>
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-2"><Crosshair size={20} /> Pin Current Location</span>
                                                            )}
                                                        </Button>
                                                    )}

                                                    {/* Hidden inputs to ensure data is submitted found in formData */}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-all focus:ring-1 focus:ring-zillow-600" placeholder="Describe the property highlights..." />
                                                </div>

                                                {formData.listingType !== 'Land' && (
                                                    <div className="md:col-span-2 mt-4">
                                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Property Features</label>
                                                        <div className="flex gap-2 mb-3">
                                                            <input type="text" value={currentFeature} onChange={(e) => setCurrentFeature(e.target.value)} placeholder="Add a feature..." className="flex-1 min-w-0 px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600 transition-all focus:ring-1 focus:ring-zillow-600" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }} />
                                                            <Button variant="secondary" type="button" onClick={handleAddFeature} className="shrink-0"><Plus size={20} /></Button>
                                                        </div>
                                                        {formData.featuresList && formData.featuresList.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {formData.featuresList.map((feat, idx) => (
                                                                    <span key={idx} className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-md text-sm flex items-start gap-2 border border-gray-200 dark:border-gray-700 max-w-full">
                                                                        <span className="break-all whitespace-normal text-left">{feat}</span>
                                                                        <button type="button" onClick={() => handleRemoveFeature(idx)} className="hover:text-red-500 shrink-0 mt-0.5"><X size={14} /></button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                                                <Button type="submit" variant="primary" className="px-12 py-3 text-lg" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Processing...' : (editingId ? 'Update Listing' : 'Publish Listing')}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 flex justify-between items-end">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Current Listings ({agentProperties.length})</h3>
                                </div>

                                <div>
                                    {agentProperties.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {agentProperties.map(property => (
                                                <div key={property.id} className="relative group">
                                                    <PropertyCard property={property} />
                                                    {isOwner && (
                                                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                                                            <button onClick={() => {
                                                                setEditingId(property.id);
                                                                setFormData({
                                                                    title: property.title, description: property.description, price: property.price.toString(), priceFrequency: property.priceFrequency || 'Year',
                                                                    address: property.address, city: property.city, state: property.state, type: property.type, listingType: property.listingType,
                                                                    bedrooms: property.bedrooms?.toString() || '', bathrooms: property.bathrooms?.toString() || '', sqft: property.sqft.toString(),
                                                                    plots: property.plots?.toString() || '', featuresList: property.features || [], imageUrl: property.imageUrl,
                                                                    latitude: property.latitude?.toString() || '', longitude: property.longitude?.toString() || ''
                                                                });
                                                                setMediaPreviews({ images: property.gallery || [property.imageUrl], video: property.videoUrls?.[0] || null });
                                                                setShowAddForm(true);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md border border-blue-700 hover:bg-blue-700">Edit</button>
                                                            <button onClick={async () => {
                                                                try {
                                                                    const newStatus = property.status === 'Sold' ? 'Available' : 'Sold';
                                                                    await propertyService.updateProperty(property.id, { status: newStatus });
                                                                    setRefreshTrigger(prev => prev + 1);
                                                                    showToast(`Property marked as ${newStatus}`, 'success');
                                                                } catch (err: any) {
                                                                    console.error(err);
                                                                    showToast(err.response?.data?.message || 'Failed to update status', 'error');
                                                                }
                                                            }} className={`${property.status === 'Sold' ? 'bg-green-600 text-white border-green-700' : 'bg-white text-slate-900 border-gray-200'} text-xs font-bold px-3 py-1 rounded shadow-md border hover:opacity-90 transition-opacity`}>
                                                                {property.status === 'Sold' ? 'Relist Property' : 'Mark as Sold'}
                                                            </button>
                                                            <button onClick={() => {
                                                                setDeleteModal({ visible: true, propertyId: property.id });
                                                            }} className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded shadow-md border border-red-600 hover:bg-red-600">Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                                            <Home className="mx-auto text-gray-300 mb-4" size={48} />
                                            <p className="text-slate-500 font-medium">No active properties listed.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};
