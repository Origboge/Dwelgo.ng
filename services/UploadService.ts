
import { api } from './api';
import axios from 'axios';

export interface UploadResponse {
    success: boolean;
    uploaded?: Array<{
        url: string;
        public_id: string;
        bytes: number;
        format: string;
    }>;
    files?: { // For single upload response structure match
        url: string;
    };
    message?: string;
    error?: string;
}

class UploadService {
    /**
     * Uploads files DIRECTLY to Cloudinary to bypass Vercel's 4.5MB payload limit.
     */
    async uploadFiles(files: FileList | File[], folder: string = 'property-lease/properties'): Promise<string[]> {
        const fileArray = Array.from(files);
        const results: string[] = [];

        for (const file of fileArray) {
            try {
                // 1. Get signature from our backend
                const sigResponse = await api.get('/upload/sign', { params: { folder } });
                const { signature, timestamp, cloud_name, api_key } = sigResponse.data.data;

                // 2. Upload directly to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', api_key);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);
                formData.append('folder', folder);

                const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;

                const uploadResp = await axios.post(cloudinaryUrl, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                results.push(uploadResp.data.secure_url);
            } catch (error: any) {
                console.error('Direct upload failed for file:', file.name, error);

                // CRITICAL: We NO LONGER fallback to backend for files, 
                // because it causes "Double Billing" on Vercel bandwidth.
                // If direct upload fails, we must tell the user.

                const errorMessage = error.response?.data?.error?.message || error.message;
                throw new Error(`Direct upload failed for ${file.name}: ${errorMessage}. Please check your internet connection.`);
            }
        }

        return results;
    }

    /**
     * Original backend upload logic (fallback)
     */
    private async uploadViaBackend(files: File[], folder: string): Promise<string[]> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('folder', folder);

        const response = await api.post<UploadResponse>('/upload/fallback', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success && response.data.uploaded) {
            return response.data.uploaded.map(f => f.url);
        }
        throw new Error(response.data.message || 'Backend upload failed');
    }

    /**
     * Uploads a single file (e.g. avatar)
     */
    async uploadSingle(file: File, folder: string = 'property-lease/avatars'): Promise<string> {
        const urls = await this.uploadFiles([file], folder);
        return urls[0];
    }
}

export const uploadService = new UploadService();
