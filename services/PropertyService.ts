import { Property } from '../types';
import { api } from './api';

class PropertyService {

    // Adapter to transform Backend JSON to Frontend Property Interface
    private mapBackendProperty(p: any): Property {
        const agentUser = p.agentId?.userId || {};
        const agentProfile = p.agentId || {};

        // Handle name splitting safely
        const fullName = agentUser.name || 'Unknown Agent';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Robustly extract sqft/area
        let extractedSqft = 0;
        if (p.area && typeof p.area.value === 'number') {
            extractedSqft = p.area.value;
        } else if (typeof p.area === 'number') {
            extractedSqft = p.area;
        } else if (typeof p.sqft === 'number') {
            extractedSqft = p.sqft;
        } else if (p.sqft && !isNaN(Number(p.sqft))) { // Handle string numbers if any
            extractedSqft = Number(p.sqft);
        }

        return {
            id: p._id,
            title: p.title,
            description: p.description,
            address: p.address?.street || p.address,
            city: p.address?.city || p.city,
            state: p.address?.state || p.state,
            price: p.price,
            type: p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1) : 'House',
            listingType: p.listingType ? p.listingType.charAt(0).toUpperCase() + p.listingType.slice(1) : 'Sale',
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            sqft: extractedSqft,
            imageUrl: p.images?.[0]?.url || p.images?.[0] || '',
            gallery: p.images?.map((img: any) => img.url || img) || [],
            videoUrls: p.videoUrls || [],
            agent: {
                id: agentProfile._id,
                firstName: firstName,
                lastName: lastName,
                email: agentUser.email,
                phone: agentProfile.phone,
                avatar: agentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName),
                agencyName: agentProfile.businessName,
                rating: (typeof agentProfile.rating === 'object' ? agentProfile.rating?.average : agentProfile.rating) || 0,
                location: agentProfile.address || '',
            },
            features: p.features || [],
            status: p.status,
            addedAt: p.createdAt,
            latitude: p.location?.coordinates?.[1] || p.latitude,
            longitude: p.location?.coordinates?.[0] || p.longitude,
            priceFrequency: p.priceFrequency,
            plots: p.plots || 0,
            isFeatured: p.isFeatured
        };
    }

    // Fetch all properties with optional filters
    async getAllProperties(filters?: any): Promise<Property[]> {
        try {
            const limit = filters?.limit || 1000;
            const response = await api.get('/properties', { params: { ...filters, limit } });
            const rawData = response.data.data || [];
            return rawData.map((p: any) => this.mapBackendProperty(p));
        } catch (error) {
            console.error('Failed to fetch properties', error);
            return [];
        }
    }

    async getAllPropertiesAdmin(params: { search?: string, page?: number, limit?: number } = {}): Promise<{ properties: Property[], total: number, pages: number }> {
        try {
            const { search, page = 1, limit = 50 } = params;
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());

            const response = await api.get(`/properties/admin/all?${queryParams.toString()}`);
            const rawData = response.data.data || [];
            const properties = rawData.map((p: any) => this.mapBackendProperty(p));

            return {
                properties,
                total: response.data.pagination?.total || 0,
                pages: response.data.pagination?.pages || 0
            };
        } catch (error) {
            console.error('Failed to fetch admin properties', error);
            return { properties: [], total: 0, pages: 0 };
        }
    }

    async getPropertyById(id: string): Promise<Property | undefined> {
        try {
            const response = await api.get(`/properties/${id}`);
            const rawData = response.data.data;
            return rawData ? this.mapBackendProperty(rawData) : undefined;
        } catch (error: any) {
            // If it's a 404, it just means the property was deleted but still referenced (e.g. in Likes)
            // No need to spam the console with errors for this expected scenario.
            if (error.response?.status !== 404) {
                console.error(`Failed to fetch property ${id}`, error);
            }
            return undefined;
        }
    }

    async getAgentProperties(agentId?: string, includeHidden: boolean = false): Promise<Property[]> {
        try {
            if (includeHidden) {
                // Fetch owner's listings (including hidden/sold) via dedicated endpoint
                const response = await api.get('/properties/agent/my-listings?limit=50');
                const all = response.data.data || [];
                return all.map((p: any) => this.mapBackendProperty(p));
            }

            // For public view, fetch ACTIVE listings
            const params: any = { status: 'active', limit: 50 };
            if (agentId) params.agentId = agentId;
            const response = await api.get('/properties', { params });
            const all = response.data.data || [];
            return all.map((p: any) => this.mapBackendProperty(p));
        } catch (error) {
            console.error('Failed to fetch agent properties', error);
            return [];
        }
    }

    async toggleFeaturedProperty(id: string, isFeatured: boolean): Promise<Property> {
        const response = await api.patch(`/properties/${id}/featured`, { isFeatured });
        return this.mapBackendProperty(response.data.data);
    }

    // Adapter to transform Frontend Property Interface to Backend Schema
    private mapFrontendToBackendProperty(p: Partial<Property>): any {
        const payload: any = {};

        if (p.title !== undefined) payload.title = p.title;
        if (p.description !== undefined) payload.description = p.description;
        if (p.price !== undefined) payload.price = p.price;

        if (p.listingType !== undefined) {
            payload.listingType = p.listingType.toLowerCase() === 'land' ? 'sale' : p.listingType.toLowerCase();
        }
        if (p.type !== undefined) {
            payload.propertyType = p.type.toLowerCase() === 'villa' ? 'house' : p.type.toLowerCase();
        }

        // Only map address if at least one address field is present
        // NOTE: This assumes that if you update address, you provide ALL address fields, 
        // OR the backend handles merging (which it doesn't seem to do well). 
        // For Status updates, these will be undefined, so address won't be sent, preserving existing data.
        if (p.address !== undefined || p.city !== undefined || p.state !== undefined) {
            payload.address = {
                street: p.address,
                city: p.city,
                state: p.state,
                country: 'Nigeria'
            };
        }

        // Map Location
        if (p.longitude !== undefined && p.latitude !== undefined) {
            payload.location = {
                type: 'Point',
                coordinates: [p.longitude || 0, p.latitude || 0]
            };
        }

        if (p.bedrooms !== undefined) payload.bedrooms = p.bedrooms;
        if (p.bathrooms !== undefined) payload.bathrooms = p.bathrooms;

        if (p.sqft !== undefined) {
            payload.area = {
                value: p.sqft,
                unit: 'sqft'
            };
        }

        if (p.gallery !== undefined || p.imageUrl !== undefined) {
            // Backend expects [String], not [{url: String}]
            payload.images = p.gallery || (p.imageUrl ? [p.imageUrl] : []);
        }

        if (p.features !== undefined) payload.features = p.features;

        // Fix: Don't default to 'active' if status is undefined, otherwise it resets status on every update.
        // Fix: Map 'Available' to 'active' to match backend enum.
        if (p.status !== undefined) {
            const lowerStatus = p.status.toLowerCase();
            payload.status = lowerStatus === 'available' ? 'active' : lowerStatus;
        }

        if (p.priceFrequency !== undefined) payload.priceFrequency = p.priceFrequency;
        if (p.plots !== undefined) payload.plots = p.plots;
        if (p.isFeatured !== undefined) payload.isFeatured = p.isFeatured;
        if (p.videoUrls !== undefined) payload.videoUrls = p.videoUrls;

        return payload;
    }

    async createProperty(property: Partial<Property>): Promise<Property | null> {
        try {
            const payload = this.mapFrontendToBackendProperty(property);

            const response = await api.post('/properties', payload);
            return response.data.data ? this.mapBackendProperty(response.data.data) : null;
        } catch (error: any) {
            console.error('Failed to create property', error);
            if (error.response) {
                console.error('Server Error Response:', JSON.stringify(error.response.data, null, 2));

                if (error.response.status === 413) {
                    throw new Error("Payload Too Large. If you are uploading a video, it may exceed the server's limit (approx. 4.5MB on Vercel).");
                }

                const errorMsg = error.response.data.message || 'Validation failed';
                const errors = error.response.data.errors;
                let validationDetails = '';

                if (errors && Array.isArray(errors)) {
                    validationDetails = '\n\nDetails:\n' + errors.map((err: any) => {
                        if (typeof err === 'string') return `• ${err}`;
                        if (err.field && err.message) return `• ${err.field}: ${err.message}`;
                        if (err.message) return `• ${err.message}`;
                        return `• ${JSON.stringify(err)}`;
                    }).join('\n');
                }

                // If it's a validation error, the alert provides good detail locally, 
                // but we also throw for the UI to show a toast.
                if (validationDetails) {
                    alert(`Creation Failed:\n${errorMsg}${validationDetails}`);
                }
                throw new Error(errorMsg);
            }
            throw error;
        }
    }

    async updateProperty(id: string, property: Partial<Property>): Promise<Property | null> {
        try {
            const payload = this.mapFrontendToBackendProperty(property);
            const response = await api.put(`/properties/${id}`, payload);
            return response.data.data ? this.mapBackendProperty(response.data.data) : null;
        } catch (error) {
            console.error('Failed to update property', error);
            throw error;
        }
    }

    async deleteProperty(propertyId: string): Promise<boolean> {
        try {
            await api.delete(`/properties/${propertyId}`);
            return true;
        } catch (error) {
            console.error('Failed to delete property', error);
            return false;
        }
    }
    async getPropertiesByIds(ids: string[]): Promise<Property[]> {
        if (!ids || ids.length === 0) return [];
        try {
            const response = await api.post('/properties/batch', { ids });
            const rawData = response.data.data || [];
            return rawData.map((p: any) => this.mapBackendProperty(p));
        } catch (error) {
            console.error('Failed to fetch properties by IDs', error);
            return [];
        }
    }
}

export const propertyService = new PropertyService();
