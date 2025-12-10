
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/PropertyService';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/Button';
import { User, Mail, Phone, MapPin, CheckCircle2, ShieldAlert, Camera, LayoutDashboard } from 'lucide-react';
import { Property } from '../types';

import { AgentProfilePage } from './AgentProfilePage';

export const UserDashboardPage: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
    const [savedProperties, setSavedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedProperties = async () => {
            if (user?.savedPropertyIds?.length) {
                try {
                    const promises = user.savedPropertyIds.map(id => propertyService.getPropertyById(id));
                    const results = await Promise.all(promises);
                    setSavedProperties(results.filter((p): p is Property => p !== undefined));
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
                try {
                    await updateProfile({ avatar: result });
                    showToast("Profile picture updated!", 'success');
                } catch (error) {
                    console.error("Failed to update profile", error);
                    showToast("Failed to save profile picture. Please try again.", 'error');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const getInitials = (first: string, last: string) => {
        const f = first ? first.charAt(0) : '';
        const l = last ? last.charAt(0) : '';
        return (f + l).toUpperCase() || 'U';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-20">
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
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800">
                                <div className="relative inline-block mb-4 group">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md bg-gray-200"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-zillow-600 text-white flex items-center justify-center text-3xl font-bold tracking-wider">
                                            {getInitials(user.firstName || user.name || 'U', user.lastName || '')}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2 bg-zillow-600 text-white rounded-full hover:bg-zillow-700 transition-colors shadow-sm"
                                        title="Change Profile Picture"
                                    >
                                        <Camera size={18} />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.firstName} {user.lastName || user.name}</h2>
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                                    <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full">{user.role} Account</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Mail size={16} />
                                            <span>{user.email}</span>
                                        </div>
                                        {user.isVerified ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full font-bold">
                                                <CheckCircle2 size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full font-bold">
                                                <ShieldAlert size={12} /> Unverified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <Phone size={16} />
                                        <span>{user.phone || 'Not set'}</span>
                                    </div>
                                </div>

                                {user.role === 'agent' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-2"
                                            onClick={() => window.location.href = `#/agents/${user.id}`}
                                        >
                                            <LayoutDashboard size={16} /> Go to Agent Profile
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

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
