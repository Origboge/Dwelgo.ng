
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/PropertyService';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { User, Mail, Phone, MapPin, CheckCircle2, ShieldAlert, Camera, LayoutDashboard, Trash2, AlertTriangle, X, Edit, Check, MessageCircle } from 'lucide-react';
import { NIGERIA_LOCATIONS } from '../nigeriaLocations';
import { Property } from '../types';

import { AgentProfilePage } from './AgentProfilePage';

export const UserDashboardPage: React.FC = () => {
    const { user, updateProfile, deleteAccount } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
    const [savedProperties, setSavedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        whatsapp: user?.whatsapp || '',
        state: user?.state || '',
        city: user?.city || ''
    });

    // Prevent scroll jump during submission
    useEffect(() => {
        if (isSubmitting) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSubmitting]);

    useEffect(() => {
        const fetchSavedProperties = async () => {
            if (user?.savedPropertyIds?.length) {
                try {
                    const results = await propertyService.getPropertiesByIds(user.savedPropertyIds);
                    setSavedProperties(results);
                } catch (error) {
                    console.error("Failed to fetch saved properties", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        if (user) {
            fetchSavedProperties();
        }
    }, [user]);

    if (!user) {
        return <div className="p-10 text-center">Please log in to view your dashboard.</div>;
    }

    // Render Agent Profile directly for agents, replacing the standard user dashboard
    if (user.role?.toLowerCase() === 'agent') {
        return <AgentProfilePage agentId={user.id} />;
    }

    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
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
                setIsSubmitting(true);
                try {
                    await updateProfile({ avatar: result });
                    showToast("Profile picture updated!", 'success');
                } catch (error) {
                    console.error("Failed to update profile", error);
                    showToast("Failed to save profile picture. Please try again.", 'error');
                } finally {
                    setIsSubmitting(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setIsSubmitting(true);
        try {
            await updateProfile({
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                phone: profileForm.phone,
                whatsapp: profileForm.whatsapp,
                state: profileForm.state,
                city: profileForm.city
            });
            showToast("Profile updated successfully!", 'success');
            setIsEditingProfile(false);
        } catch (error) {
            console.error("Update profile error", error);
            showToast("Failed to update profile. Please try again.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsSubmitting(true);
        setShowDeleteConfirm(false);
        try {
            await deleteAccount();
            showToast("Account deleted successfully. We're sorry to see you go.", 'success');
            // AuthContext will handle state, but ensure we redirect or let it happen
            window.location.href = '#/';
        } catch (error) {
            console.error("Delete account error", error);
            showToast("Failed to delete account. Please try again.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableCities = profileForm.state ? NIGERIA_LOCATIONS[profileForm.state as keyof typeof NIGERIA_LOCATIONS] || [] : [];

    const getInitials = (first: string, last: string) => {
        const f = first ? first.charAt(0) : '';
        const l = last ? last.charAt(0) : '';
        return (f + l).toUpperCase() || 'U';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-20">
            {/* Global Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-zillow-600 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-zillow-600">
                            <User className="animate-pulse" size={32} />
                        </div>
                    </div>
                    <p className="mt-8 text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">Updating <span className="text-zillow-600">Account</span></p>
                </div>
            )}

            {/* Toast Notification */}
            {toast.visible && (
                <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl animate-slide-down ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}

            {/* Header Background */}
            <div className="bg-slate-900 pb-32 pt-20">


                <div className="container mx-auto px-6">
                    <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
                    <p className="text-slate-400">Manage your profile and liked properties</p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-24">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Profile Card */}
                    <div className="lg:w-1/3">
                        <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl transition-colors duration-300">
                            {/* Decorative Background Glow - Dark Mode Only */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none dark:from-blue-500/10"></div>

                            <div className="relative mb-4">
                                <div className="w-28 h-28 rounded-full p-0.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0F172A]"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white flex items-center justify-center text-3xl font-bold border-2 border-white dark:border-[#0F172A]">
                                            {getInitials(user.firstName || user.name || 'U', user.lastName || '')}
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow transition-transform hover:scale-110 border-2 border-white dark:border-[#0F172A]"
                                    title="Change Profile Picture"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>

                            {isEditingProfile ? (
                                <div className="space-y-3 w-full mb-4">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                                    {user.firstName} <span className="text-slate-500 dark:text-slate-400">{user.lastName || user.name}</span>
                                </h2>
                            )}
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6 font-medium">
                                <span className="capitalize px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{user.role} Account</span>
                                {!isEditingProfile && (
                                    <button
                                        onClick={() => {
                                            setProfileForm({
                                                firstName: user.firstName || '',
                                                lastName: user.lastName || '',
                                                phone: user.phone || '',
                                                state: user.state || '',
                                                city: user.city || ''
                                            });
                                            setIsEditingProfile(true);
                                        }}
                                        className="p-1 hover:text-blue-500 transition-colors"
                                        title="Edit Profile"
                                    >
                                        <Edit size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="w-full space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                            <Mail size={16} className="text-blue-500" />
                                            <span className="truncate max-w-[180px]">{user.email}</span>
                                        </div>
                                        {user.isVerified ? (
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        ) : (
                                            <ShieldAlert size={16} className="text-amber-500" />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                                    {isEditingProfile ? (
                                        <input
                                            type="tel"
                                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                            <Phone size={16} className="text-blue-500" />
                                            <span>{user.phone || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>

                                {user.role === 'agent' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">WhatsApp Number</label>
                                        {isEditingProfile ? (
                                            <input
                                                type="tel"
                                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                value={profileForm.whatsapp}
                                                onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                                placeholder="e.g. 08012345678"
                                                required
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                                <MessageCircle size={16} className="text-green-500" />
                                                <span>{user.whatsapp || user.phone || 'Not set'}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</label>
                                    {isEditingProfile ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                className="w-full p-2 text-xs border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none"
                                                value={profileForm.state}
                                                onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value, city: '' })}
                                            >
                                                <option value="">State</option>
                                                {Object.keys(NIGERIA_LOCATIONS).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="w-full p-2 text-xs border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none"
                                                value={profileForm.city}
                                                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                                disabled={!profileForm.state}
                                            >
                                                <option value="">City</option>
                                                {availableCities.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                            <MapPin size={16} className="text-blue-500" />
                                            <span>{user.city ? `${user.city}, ${user.state}` : user.location || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>

                                {isEditingProfile && (
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                                        >
                                            <Check size={16} /> Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditingProfile(false)}
                                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-bold text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {user.role === 'agent' && (
                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            onClick={() => window.location.href = `#/agents/${user.id}`}
                                        >
                                            <LayoutDashboard size={16} /> Go to Agent Profile
                                        </Button>
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 w-full">
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-bold text-sm"
                                    >
                                        <Trash2 size={16} /> Delete Account Permanently
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 scale-in-center overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/10 text-red-600 rounded-xl">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <button onClick={() => setShowDeleteConfirm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Delete Account?</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                    This action is <span className="text-red-600 font-bold">permanent</span> and cannot be undone. All your saved properties and profile information will be lost.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} /> YES, DELETE ACCOUNT
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl transition-colors"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="lg:w-2/3">
                        {/* Saved Properties */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 p-2 rounded-lg"><CheckCircle2 className="fill-current" size={20} /></span>
                                My Likes
                                <span className="text-sm font-normal text-slate-500 ml-2">({savedProperties.length})</span>
                            </h3>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zillow-600 mx-auto"></div>
                                </div>
                            ) : savedProperties.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {savedProperties.map(property => (
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
                    </div>
                </div>
            </div>
        </div>
    );
};
