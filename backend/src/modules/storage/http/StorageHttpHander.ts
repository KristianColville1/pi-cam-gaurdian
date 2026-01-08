import { Request, Response } from 'express';
import { AppDataSource } from '../../../core/config/database.js';
import { File } from '../entities/File.entity.js';
import { Recording } from '../entities/Recording.entity.js';
import env from '../../../core/config/env.js';

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

      const FileRepository = AppDataSource.getRepository(File);
      const queryBuilder = FileRepository.createQueryBuilder('file');

      queryBuilder.where('file.deleted_at IS NULL');

      if (file_type) {
        queryBuilder.andWhere('file.file_type = :file_type', { file_type });
      }

      const sortOrder = (order as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const validSortFields = ['created_at', 'updated_at', 'file_type', 'file_size'];
      const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';
      queryBuilder.orderBy(`file.${sortField}`, sortOrder);

      const totalCount = await queryBuilder.getCount();

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      queryBuilder.skip(skip).take(limitNum);

      const files = await queryBuilder.getMany();

      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        data: files,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error: any) {
      console.error('Get files error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async getFileById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const FileRepository = AppDataSource.getRepository(File);
      const file = await FileRepository.findOne({
        where: { id, deleted_at: null },
      });

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
      const FileRepository = AppDataSource.getRepository(File);
      const file = await FileRepository.findOne({
        where: { id, deleted_at: null },
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const {
        title,
        metadata,
        file_type,
      } = req.body;

      if (title !== undefined) {
        file.object_name = title;
      }
      if (metadata !== undefined) {
        file.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
      }
      if (file_type !== undefined) {
        file.file_type = file_type;
      }

      const updatedFile = await FileRepository.save(file);

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
      const FileRepository = AppDataSource.getRepository(File);
      const file = await FileRepository.findOne({
        where: { id, deleted_at: null },
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      file.deleted_at = new Date();
      await FileRepository.save(file);

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

      const RecordingRepository = AppDataSource.getRepository(Recording);
      const queryBuilder = RecordingRepository.createQueryBuilder('recording');

      queryBuilder.where('recording.deleted_at IS NULL');

      if (status) {
        queryBuilder.andWhere('recording.status = :status', { status });
      }

      const sortOrder = (order as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const validSortFields = ['created_at', 'updated_at', 'recorded_at', 'uploaded_at', 'status'];
      const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';
      queryBuilder.orderBy(`recording.${sortField}`, sortOrder);

      const totalCount = await queryBuilder.getCount();

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      queryBuilder.skip(skip).take(limitNum);

      const recordings = await queryBuilder.getMany();

      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        data: recordings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error: any) {
      console.error('Get recordings error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  async getRecordingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const RecordingRepository = AppDataSource.getRepository(Recording);
      const recording = await RecordingRepository.findOne({
        where: { id, deleted_at: null },
      });

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
      const RecordingRepository = AppDataSource.getRepository(Recording);
      const recording = await RecordingRepository.findOne({
        where: { id, deleted_at: null },
      });

      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      const {
        title,
        metadata,
        status,
      } = req.body;

      if (title !== undefined) {
        recording.title = title;
      }
      if (metadata !== undefined) {
        recording.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
      }
      if (status !== undefined) {
        recording.status = status;
      }

      const updatedRecording = await RecordingRepository.save(recording);

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
      const RecordingRepository = AppDataSource.getRepository(Recording);
      const recording = await RecordingRepository.findOne({
        where: { id, deleted_at: null },
      });

      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      recording.deleted_at = new Date();
      await RecordingRepository.save(recording);

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

