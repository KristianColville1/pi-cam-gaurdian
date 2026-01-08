import env from '../../../core/config/env.js';
import recordingRepository from '../repositories/RecordingRepository.js';
class BunnyManager {
    apiKey;
    libraryId;
    baseUrl;
    constructor() {
        this.apiKey = env.VIDEO_CDN_API_KEY || '';
        this.libraryId = env.VIDEO_CDN_LIBRARY_ID || '';
        this.baseUrl = 'https://video.bunnycdn.com/library';
    }
    /**
     * Update recording metadata from Bunny.net API
     * Fetches video details and updates file_size and duration
     * @param {string} recordingId - The recording ID from repository
     */
    async updateRecordingMetadata(recordingId) {
        if (!this.apiKey || !this.libraryId) {
            console.warn('Bunny.net API credentials not configured');
            return;
        }
        const recording = await recordingRepository.findById(recordingId);
        if (!recording) {
            console.warn(`Recording not found: ${recordingId}`);
            return;
        }
        const videoGuid = (recording.video_id || recording.guid);
        if (!videoGuid) {
            console.warn(`Recording ${recordingId} has no video_id or guid`);
            return;
        }
        try {
            const videoDetails = await this.fetchVideoDetails(videoGuid);
            if (videoDetails) {
                const updateData = {};
                if (videoDetails.storageSize !== undefined) {
                    updateData.file_size = videoDetails.storageSize;
                }
                if (videoDetails.length_s !== undefined) {
                    updateData.duration = videoDetails.length_s;
                }
                if (Object.keys(updateData).length > 0) {
                    await recordingRepository.updateMetadata(recordingId, updateData);
                }
            }
        }
        catch (error) {
            console.error(`Failed to update recording metadata for ${recordingId}:`, error.message);
            // Don't throw - we don't want webhook processing to fail if metadata update fails
        }
    }
    /**
     * Fetch video details from Bunny.net API
     * @param {string} videoGuid - The video GUID
     * @returns {Promise<{storageSize?: number, length_s?: number}>}
     */
    async fetchVideoDetails(videoGuid) {
        const url = `${this.baseUrl}/${this.libraryId}/videos/${videoGuid}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'AccessKey': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Video not found in Bunny.net: ${videoGuid}`);
                return null;
            }
            throw new Error(`Bunny.net API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return {
            storageSize: data.StorageSize !== undefined ? data.StorageSize : data.storageSize,
            length_s: data.Length !== undefined ? data.Length : data.length_s,
        };
    }
}
export default new BunnyManager();
//# sourceMappingURL=BunnyManager.js.map