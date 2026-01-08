import axios from 'axios';
class PiGuardHttpHandler {
    client;
    baseUrl;
    constructor() {
        this.baseUrl = process.env.PI_GUARD_URL;
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000, // 30 seconds timeout for camera operations
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Get list of available endpoints from pi-guard
     */
    async getEndpoints(req, res) {
        try {
            const response = await this.client.get('/endpoints');
            res.json({ data: response.data });
        }
        catch (error) {
            console.error('Get endpoints error:', error);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message || 'Failed to fetch endpoints';
            res.status(status).json({ error: message });
        }
    }
    /**
     * Capture an image from the pi camera
     */
    async captureImage(req, res) {
        try {
            const response = await this.client.get('/camera/capture');
            res.json({ data: response.data });
        }
        catch (error) {
            console.error('Capture image error:', error);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message || 'Failed to capture image';
            res.status(status).json({ error: message });
        }
    }
    /**
     * Start video recording
     */
    async startRecording(req, res) {
        try {
            const response = await this.client.get('/camera/recording/start');
            res.json({ data: response.data });
        }
        catch (error) {
            console.error('Start recording error:', error);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message || 'Failed to start recording';
            res.status(status).json({ error: message });
        }
    }
    /**
     * Stop video recording
     */
    async stopRecording(req, res) {
        try {
            const response = await this.client.get('/camera/recording/stop');
            res.json({ data: response.data });
        }
        catch (error) {
            console.error('Stop recording error:', error);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message || 'Failed to stop recording';
            res.status(status).json({ error: message });
        }
    }
    /**
     * Get recording status
     */
    async getRecordingStatus(req, res) {
        try {
            const response = await this.client.get('/camera/recording/status');
            res.json({ data: response.data });
        }
        catch (error) {
            console.error('Get recording status error:', error);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message || 'Failed to get recording status';
            res.status(status).json({ error: message });
        }
    }
    /**
     * Get an image file by filename
     */
    async getImage(req, res) {
        try {
            const { filename } = req.params;
            const response = await this.client.get(`/camera/image/${filename}`, {
                responseType: 'arraybuffer',
            });
            // Set appropriate headers
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Length', response.data.length);
            res.send(Buffer.from(response.data));
        }
        catch (error) {
            console.error('Get image error:', error);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message || 'Failed to get image';
            res.status(status).json({ error: message });
        }
    }
    /**
     * Get health status from pi-guard
     */
    async getHealth(req, res) {
        try {
            const response = await this.client.get('/health');
            res.json({ data: response.data });
        }
        catch (error) {
            console.error('Get health error:', error);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || error.message || 'Failed to get health status';
            res.status(status).json({ error: message });
        }
    }
}
export default PiGuardHttpHandler;
//# sourceMappingURL=PiGuardHttpHandler.js.map