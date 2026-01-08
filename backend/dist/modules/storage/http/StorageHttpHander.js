import env from '../../../core/config/env.js';
import fileRepository from '../repositories/FileRepository.js';
import recordingRepository from '../repositories/RecordingRepository.js';
class StorageHttpHandler {
    async getFiles(req, res) {
        try {
            const { page = 1, limit = 50, sort = 'created_at', order = 'DESC', file_type, } = req.query;
            const result = await fileRepository.findMany({
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: sort,
                order: order.toUpperCase(),
                file_type: file_type,
            });
            res.json(result);
        }
        catch (error) {
            console.error('Get files error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async getFileById(req, res) {
        try {
            const { id } = req.params;
            const file = await fileRepository.findById(id);
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }
            res.json({ data: file });
        }
        catch (error) {
            console.error('Get file by ID error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async updateFile(req, res) {
        try {
            const { id } = req.params;
            const { title, metadata, file_type, } = req.body;
            const updateData = {};
            if (title !== undefined) {
                updateData.object_name = title;
            }
            if (metadata !== undefined) {
                updateData.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
            }
            if (file_type !== undefined) {
                updateData.file_type = file_type;
            }
            const updatedFile = await fileRepository.update(id, updateData);
            if (!updatedFile) {
                return res.status(404).json({ error: 'File not found' });
            }
            res.json({
                message: 'File updated successfully',
                data: updatedFile,
            });
        }
        catch (error) {
            console.error('Update file error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async deleteFile(req, res) {
        try {
            const { id } = req.params;
            const file = await fileRepository.findById(id);
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }
            await fileRepository.softDelete(id);
            if (file.path && env.CDN_HOST && env.CDN_USER && env.CDN_PASS) {
                try {
                    await this.deleteFileFromCDN(file.path, file.storage_zone_name);
                }
                catch (cdnError) {
                    console.error('CDN delete error (continuing with soft delete):', cdnError);
                }
            }
            res.json({ message: 'File deleted successfully' });
        }
        catch (error) {
            console.error('Delete file error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async getRecordings(req, res) {
        try {
            const { page = 1, limit = 50, sort = 'created_at', order = 'DESC', status, } = req.query;
            const result = await recordingRepository.findMany({
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: sort,
                order: order.toUpperCase(),
                status: status,
            });
            res.json(result);
        }
        catch (error) {
            console.error('Get recordings error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async getRecordingById(req, res) {
        try {
            const { id } = req.params;
            const recording = await recordingRepository.findById(id);
            if (!recording) {
                return res.status(404).json({ error: 'Recording not found' });
            }
            res.json({ data: recording });
        }
        catch (error) {
            console.error('Get recording by ID error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async updateRecording(req, res) {
        try {
            const { id } = req.params;
            const { title, metadata, status, } = req.body;
            const updateData = {};
            if (title !== undefined) {
                updateData.title = title;
            }
            if (metadata !== undefined) {
                updateData.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
            }
            if (status !== undefined) {
                updateData.status = status;
            }
            const updatedRecording = await recordingRepository.update(id, updateData);
            if (!updatedRecording) {
                return res.status(404).json({ error: 'Recording not found' });
            }
            res.json({
                message: 'Recording updated successfully',
                data: updatedRecording,
            });
        }
        catch (error) {
            console.error('Update recording error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async deleteRecording(req, res) {
        try {
            const { id } = req.params;
            const recording = await recordingRepository.findById(id);
            if (!recording) {
                return res.status(404).json({ error: 'Recording not found' });
            }
            await recordingRepository.softDelete(id);
            if (recording.video_id && env.VIDEO_CDN_API_KEY && env.VIDEO_CDN_LIBRARY_ID) {
                try {
                    await this.deleteRecordingFromCDN(recording.video_id);
                }
                catch (cdnError) {
                    console.error('CDN delete error (continuing with soft delete):', cdnError);
                }
            }
            res.json({ message: 'Recording deleted successfully' });
        }
        catch (error) {
            console.error('Delete recording error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async deleteFileFromCDN(filePath, storageZoneName) {
        if (!env.CDN_PASS) {
            return;
        }
        const zoneName = storageZoneName || env.CDN_HOST || '';
        if (!zoneName) {
            return;
        }
        const url = `https://storage.bunny.net/${zoneName}/${filePath}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'AccessKey': env.CDN_PASS,
            },
        });
        if (!response.ok && response.status !== 404) {
            throw new Error(`CDN delete failed: ${response.status} ${response.statusText}`);
        }
    }
    async deleteRecordingFromCDN(videoId) {
        if (!env.VIDEO_CDN_API_KEY || !env.VIDEO_CDN_LIBRARY_ID) {
            return;
        }
        const url = `https://video.bunnycdn.com/library/${env.VIDEO_CDN_LIBRARY_ID}/videos/${videoId}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'AccessKey': env.VIDEO_CDN_API_KEY,
            },
        });
        if (!response.ok && response.status !== 404) {
            throw new Error(`CDN delete failed: ${response.status} ${response.statusText}`);
        }
    }
}
export default StorageHttpHandler;
//# sourceMappingURL=StorageHttpHander.js.map