import { Request, Response } from 'express';
import { AppDataSource } from '../../../core/config/database.js';
import { Recording } from '../entities/Recording.entity.js';

class WebhookHttpHandler {
  /**
   * Handle status 0 - Queued
   */
  async handleQueued(videoGuid: string, videoLibraryId: number) {
    const RecordingRepository = AppDataSource.getRepository(Recording);
    
    let recording = await RecordingRepository.findOne({
      where: { video_id: videoGuid },
    });

    if (recording) {
      recording.status = 'queued';
      recording.video_library_id = videoLibraryId.toString();
      await RecordingRepository.save(recording);
    } else {
      recording = RecordingRepository.create({
        video_id: videoGuid,
        guid: videoGuid,
        video_library_id: videoLibraryId.toString(),
        status: 'queued',
      });
      await RecordingRepository.save(recording);
    }
  }

  /**
   * Handle status 1 - Processing
   */
  async handleProcessing(videoGuid: string, videoLibraryId: number) {
    const RecordingRepository = AppDataSource.getRepository(Recording);
    
    let recording = await RecordingRepository.findOne({
      where: { video_id: videoGuid },
    });

    if (recording) {
      recording.status = 'processing';
      recording.video_library_id = videoLibraryId.toString();
      await RecordingRepository.save(recording);
    } else {
      recording = RecordingRepository.create({
        video_id: videoGuid,
        guid: videoGuid,
        video_library_id: videoLibraryId.toString(),
        status: 'processing',
      });
      await RecordingRepository.save(recording);
    }
  }

  /**
   * Handle status 2 - Encoding
   */
  async handleEncoding(videoGuid: string, videoLibraryId: number) {
    const RecordingRepository = AppDataSource.getRepository(Recording);
    
    let recording = await RecordingRepository.findOne({
      where: { video_id: videoGuid },
    });

    if (recording) {
      recording.status = 'encoding';
      recording.video_library_id = videoLibraryId.toString();
      await RecordingRepository.save(recording);
    } else {
      recording = RecordingRepository.create({
        video_id: videoGuid,
        guid: videoGuid,
        video_library_id: videoLibraryId.toString(),
        status: 'encoding',
      });
      await RecordingRepository.save(recording);
    }
  }

  /**
   * Handle status 3 - Finished
   */
  async handleFinished(videoGuid: string, videoLibraryId: number) {
    const RecordingRepository = AppDataSource.getRepository(Recording);
    
    let recording = await RecordingRepository.findOne({
      where: { video_id: videoGuid },
    });

    if (recording) {
      recording.status = 'finished';
      recording.video_library_id = videoLibraryId.toString();
        recording.uploaded_at = new Date();
      await RecordingRepository.save(recording);
    } else {
      recording = RecordingRepository.create({
        video_id: videoGuid,
        guid: videoGuid,
        video_library_id: videoLibraryId.toString(),
        status: 'finished',
        uploaded_at: new Date(),
      });
      await RecordingRepository.save(recording);
    }
  }

  /**
   * Handle status 4 - Resolution finished
   */
  async handleResolutionFinished(videoGuid: string, videoLibraryId: number) {
    const RecordingRepository = AppDataSource.getRepository(Recording);
    
    let recording = await RecordingRepository.findOne({
      where: { video_id: videoGuid },
    });

    if (recording) {
      recording.status = 'resolution_finished';
      recording.video_library_id = videoLibraryId.toString();
      await RecordingRepository.save(recording);
    } else {
      recording = RecordingRepository.create({
        video_id: videoGuid,
        guid: videoGuid,
        video_library_id: videoLibraryId.toString(),
        status: 'resolution_finished',
      });
      await RecordingRepository.save(recording);
    }
  }

  /**
   * Handle status 5 - Failed
   */
  async handleFailed(videoGuid: string, videoLibraryId: number) {
    const RecordingRepository = AppDataSource.getRepository(Recording);
    
    let recording = await RecordingRepository.findOne({
      where: { video_id: videoGuid },
    });

    if (recording) {
      recording.status = 'failed';
      recording.video_library_id = videoLibraryId.toString();
      await RecordingRepository.save(recording);
    } else {
      recording = RecordingRepository.create({
        video_id: videoGuid,
        guid: videoGuid,
        video_library_id: videoLibraryId.toString(),
        status: 'failed',
      });
      await RecordingRepository.save(recording);
    }
  }

  /**
   * Handle webhook request and route to appropriate status handler
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const { VideoLibraryId, VideoGuid, Status } = req.body;

      if (!VideoGuid || Status === undefined || !VideoLibraryId) {
        return res.status(400).json({
          error: 'Missing required fields: VideoLibraryId, VideoGuid, Status',
        });
      }

      // Route to appropriate handler based on status
      switch (Status) {
        case 0:
          await this.handleQueued(VideoGuid, VideoLibraryId);
          break;
        case 1:
          await this.handleProcessing(VideoGuid, VideoLibraryId);
          break;
        case 2:
          await this.handleEncoding(VideoGuid, VideoLibraryId);
          break;
        case 3:
          await this.handleFinished(VideoGuid, VideoLibraryId);
          break;
        case 4:
          await this.handleResolutionFinished(VideoGuid, VideoLibraryId);
          break;
        case 5:
          await this.handleFailed(VideoGuid, VideoLibraryId);
          break;
        default:
          // Status 6-10 are not implemented, but we'll log and return success
          console.log(`Webhook received for unhandled status ${Status} for video ${VideoGuid}`);
          return res.status(200).json({
            success: true,
            message: `Status ${Status} received but not handled`,
          });
      }

      res.status(200).json({
        success: true,
        message: `Status ${Status} processed successfully`,
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

