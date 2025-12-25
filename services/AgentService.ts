import { Agent } from '../types';
import { api } from './api';

class AgentService {
    async getAgentById(id: string): Promise<Agent | undefined> {
        try {
            const response = await api.get(`/agents/${id}`);
            // Backend returns { success: true, agent: { ... } }
            const data = response.data.agent || response.data.data || response.data;
            return this.mapBackendAgent(data);
        } catch (error) {
            console.error(`Failed to fetch agent ${id}`, error);
            return undefined;
        }
    }

    async getAllAgents(): Promise<Agent[]> {
        try {
            const response = await api.get('/agents');
            const data = response.data.data || response.data || [];
            return data.map((a: any) => this.mapBackendAgent(a));
        } catch (error) {
            console.error('Failed to fetch agents', error);
            return [];
        }
    }

    private mapBackendAgent(data: any): Agent {
        // Handle nested user object or flat structure
        const user = data.userId || data;

        return {
            id: data._id || user._id,
            firstName: user.firstName || user.name?.split(' ')[0] || 'Unknown',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: data.phone || user.phone,
            whatsapp: data.whatsapp || user.whatsapp,
            avatar: user.avatar || data.avatar || '',
            agencyName: data.businessName || data.agencyName || 'Independent',
            rating: typeof data.rating === 'object' ? (data.rating.average || 0) : (data.rating || 0),
            ratingCount: typeof data.rating === 'object' ? (data.rating.count || 0) : (data.ratingCount || 0),
            licenseNumber: data.licenseNumber,
            bio: data.bio || user.bio,
            experience: data.experience || user.experience,
            location: data.address || user.location,
            socials: data.socials,
            userId: data.userId // Preserve the userId (populated object or ID)
        };
    }
    async rateAgent(agentId: string, rating: number): Promise<{ newRating: number; count: number }> {
        const response = await api.post(`/agents/${agentId}/rate`, { rating });
        return response.data.data;
    }
}

export const agentService = new AgentService();
