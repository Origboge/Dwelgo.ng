import React, { useEffect, useState } from 'react';
import { propertyService } from '../services/PropertyService';
import { Property } from '../types';
import { ShieldCheck, Star, Search, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
// import { toast } from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Server-side pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [filter, setFilter] = useState<'all' | 'featured'>('all'); // This is now mostly just visual unless we add backend filter

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProperties();
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm, page]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await propertyService.getAllPropertiesAdmin({
                search: searchTerm,
                page: page,
                limit: 10
            });

            setProperties(response.properties);
            setTotalPages(response.pages);
            setTotalItems(response.total);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (property: Property) => {
        try {
            const newStatus = !property.isFeatured;
            await propertyService.toggleFeaturedProperty(property.id, newStatus);

            // Optimistic update
            setProperties(prev => prev.map(p =>
                p.id === property.id ? { ...p, isFeatured: newStatus } : p
            ));

        } catch (error) {
            console.error("Failed to toggle feature", error);
            alert("Failed to update property");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="text-indigo-600" />
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-600 mt-1">Manage Property Listings & Features</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <span className="text-sm font-semibold text-slate-700">Total Found: {totalItems}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title or city..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                        />
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Prev
                        </Button>
                        <span className="text-sm text-slate-600">Page {page} of {totalPages || 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* Table / List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4">Property</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4 text-center">Featured</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td></tr>
                                ) : properties.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No properties found.</td></tr>
                                ) : (
                                    properties.map(property => (
                                        <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 max-w-xs">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={property.imageUrl}
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-slate-900 truncate">{property.title}</div>
                                                        <div className="text-xs text-slate-500">{property.propertyType} • {property.listingType}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {property.address.city}, {property.address.state}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-900">
                                                ₦{property.price.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleToggleFeatured(property)}
                                                    className={`p-2 rounded-full transition-all ${property.isFeatured
                                                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    title="Toggle Featured"
                                                >
                                                    <Star size={18} className={property.isFeatured ? 'fill-yellow-600' : ''} />
                                                </button>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {property.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {/* Placeholder for future detailed edit */}
                                                <Button variant="outline" size="sm" onClick={() => window.open(`/properties/${property._id}`, '_blank')}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};
