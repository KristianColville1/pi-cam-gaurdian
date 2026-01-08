import { Request, Response } from 'express';
import env from '../../../core/config/env.js';
import fileRepository from '../repositories/FileRepository.js';
import recordingRepository from '../repositories/RecordingRepository.js';

class StorageHttpHandler {
  async getFiles(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 50,
        sort = 'created_at',
        order = 'DESC',
        file_type,
      } = req.query;

      const result = await fileRepository.findMany({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sort: sort as string,
        order: (order as string).toUpperCase() as 'ASC' | 'DESC',
        file_type: file_type as string,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Get files error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async getFileById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const file = await fileRepository.findById(id);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json({ data: file });
    } catch (error: any) {
      console.error('Get file by ID error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async updateFile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        metadata,
        file_type,
      } = req.body;

      const updateData: any = {};
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
    } catch (error: any) {
      console.error('Update file error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async deleteFile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const file = await fileRepository.findById(id);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      await fileRepository.softDelete(id);

      if (file.path && env.CDN_HOST && env.CDN_USER && env.CDN_PASS) {
        try {
          await this.deleteFileFromCDN(file.path as string, file.storage_zone_name as string);
        } catch (cdnError: any) {
          console.error('CDN delete error (continuing with soft delete):', cdnError);
        }
      }

      res.json({ message: 'File deleted successfully' });
    } catch (error: any) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async getRecordings(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 50,
        sort = 'created_at',
        order = 'DESC',
        status,
      } = req.query;

      const result = await recordingRepository.findMany({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sort: sort as string,
        order: (order as string).toUpperCase() as 'ASC' | 'DESC',
        status: status as string,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Get recordings error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async getRecordingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recording = await recordingRepository.findById(id);

      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      res.json({ data: recording });
    } catch (error: any) {
      console.error('Get recording by ID error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async updateRecording(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        metadata,
        status,
      } = req.body;

      const updateData: any = {};
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
    } catch (error: any) {
      console.error('Update recording error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async deleteRecording(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recording = await recordingRepository.findById(id);

      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      await recordingRepository.softDelete(id);

      if (recording.video_id && env.VIDEO_CDN_API_KEY && env.VIDEO_CDN_LIBRARY_ID) {
        try {
          await this.deleteRecordingFromCDN(recording.video_id as string);
        } catch (cdnError: any) {
          console.error('CDN delete error (continuing with soft delete):', cdnError);
        }
      }

      res.json({ message: 'Recording deleted successfully' });
    } catch (error: any) {
      console.error('Delete recording error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  private async deleteFileFromCDN(filePath: string, storageZoneName?: string) {
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

  private async deleteRecordingFromCDN(videoId: string) {
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
