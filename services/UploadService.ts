
import { api } from './api';

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
     * Uploads multiple files to the backend.
     * @param files FileList or Array of Files
     * @param folder Optional Cloudinary folder path
     */
    async uploadFiles(files: FileList | File[], folder: string = 'property-lease/properties'): Promise<string[]> {
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });

        formData.append('folder', folder);

        try {
            const response = await api.post<UploadResponse>('/upload/fallback', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success && response.data.uploaded) {
                return response.data.uploaded.map(f => f.url);
            }
            throw new Error(response.data.message || 'Upload failed');
        } catch (error: any) {
            console.error('Upload service error:', error);
            throw error.response?.data?.message || error.message || 'Failed to upload files';
        }
    }

    /**
     * Uploads a single file (e.g. avatar)
     */
    async uploadSingle(file: File, folder: string = 'property-lease/avatars'): Promise<string> {
        // reuse the same endpoint or a specific one if available. 
        // The backend `uploadRoutes` has `/fallback` which handles array('files').
        // Let's stick to that for now to avoid complexity, even for single files.
        const urls = await this.uploadFiles([file], folder);
        return urls[0];
    }
}

export const uploadService = new UploadService();
