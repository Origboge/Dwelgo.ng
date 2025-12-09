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
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            sqft: p.area?.value || p.area || p.sqft,
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
                rating: agentProfile.rating || 0,
                location: agentProfile.address || '',
            },
            features: p.features || [],
            status: p.status,
            addedAt: p.createdAt,
            latitude: p.location?.coordinates?.[1] || p.latitude,
            longitude: p.location?.coordinates?.[0] || p.longitude,
            priceFrequency: p.priceFrequency,
            plots: p.plots,
            isFeatured: p.isFeatured
        };
    }

    // Fetch all properties with optional filters
    async getAllProperties(filters?: any): Promise<Property[]> {
        try {
            const response = await api.get('/properties', { params: filters });
            const rawData = response.data.data || [];
            return rawData.map((p: any) => this.mapBackendProperty(p));
        } catch (error) {
            console.error('Failed to fetch properties', error);
            return [];
        }
    }

    async getPropertyById(id: string): Promise<Property | undefined> {
        try {
            const response = await api.get(`/properties/${id}`);
            const rawData = response.data.data;
            return rawData ? this.mapBackendProperty(rawData) : undefined;
        } catch (error) {
            console.error(`Failed to fetch property ${id}`, error);
            return undefined;
        }
    }

    async getAgentProperties(agentId?: string): Promise<Property[]> {
        try {
            const response = await api.get('/properties');
            const all = response.data.data || [];
            // Filter logic if backend doesn't explicitly support agentId filter in the public endpoint
            const filtered = agentId
                ? all.filter((p: any) => p.agentId?._id === agentId || p.agentId === agentId)
                : all;

            return filtered.map((p: any) => this.mapBackendProperty(p));
        } catch (error) {
            console.error('Failed to fetch agent properties', error);
            return [];
        }
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
            payload.images = p.gallery?.map(url => ({ url })) || (p.imageUrl ? [{ url: p.imageUrl }] : []);
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

        return payload;
    }

    async createProperty(property: Partial<Property>): Promise<Property | null> {
        try {
            const payload = this.mapFrontendToBackendProperty(property);
            console.log('Sending Property Payload:', JSON.stringify(payload, null, 2));

            const response = await api.post('/properties', payload);
            return response.data.data ? this.mapBackendProperty(response.data.data) : null;
        } catch (error: any) {
            console.error('Failed to create property', error);
            if (error.response) {
                console.error('Server Validation Response:', JSON.stringify(error.response.data, null, 2));
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

                alert(`Creation Failed:\n${errorMsg}${validationDetails}`);
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
}

export const propertyService = new PropertyService();
