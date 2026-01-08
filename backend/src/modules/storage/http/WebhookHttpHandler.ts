import { Request, Response } from 'express';
import { AppDataSource } from '../../../core/config/database.js';
import { Recording } from '../entities/Recording.entity.js';
import bunnyManager from '../managers/BunnyManager.js';

class WebhookHttpHandler {
  /**
   * Status code to status string mapping
   */
  private statusMap: Record<number, string> = {
    0: 'queued',
    1: 'processing',
    2: 'encoding',
    3: 'finished',
    4: 'resolution_finished',
    5: 'failed',
  };

  /**
   * Handle webhook request and update recording status
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const { VideoLibraryId, VideoGuid, Status } = req.body;

      if (!VideoGuid || Status === undefined || !VideoLibraryId) {
        return res.status(400).json({
          error: 'Missing required fields: VideoLibraryId, VideoGuid, Status',
        });
      }

      const statusCode = Number(Status);
      const statusString = this.statusMap[statusCode];

      if (!statusString) {
        // Status 6-10 are not implemented, but we'll log and return success
        console.log(`Webhook received for unhandled status ${statusCode} for video ${VideoGuid}`);
        return res.status(200).json({
          success: true,
          message: `Status ${statusCode} received but not handled`,
        });
      }

      const RecordingRepository = AppDataSource.getRepository(Recording);
      
      let recording = await RecordingRepository.findOne({
        where: { video_id: VideoGuid },
      });

      if (recording) {
        recording.status = statusString;
        recording.video_library_id = VideoLibraryId.toString();
        if (statusCode === 3) {
          recording.uploaded_at = new Date();
        }
        const savedRecording = await RecordingRepository.save(recording);
        await bunnyManager.updateRecordingMetadata(savedRecording.id as string);
      } else {
        const recordingData: any = {
          video_id: VideoGuid,
          guid: VideoGuid,
          video_library_id: VideoLibraryId.toString(),
          status: statusString,
        };
        if (statusCode === 3) {
          recordingData.uploaded_at = new Date();
        }
        const newRecording = RecordingRepository.create(recordingData);
        const savedRecording = await RecordingRepository.save(newRecording) as any;
        await bunnyManager.updateRecordingMetadata(savedRecording.id as string);
      }

      res.status(200).json({
        success: true,
        message: `Status ${statusCode} processed successfully`,
      });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
}

export default WebhookHttpHandler;
