import { AppDataSource } from '../../../core/config/database.js';
import { Recording } from '../entities/Recording.entity.js';

class RecordingRepository {
  private repository = AppDataSource.getRepository(Recording);

  async findMany(options: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
    status?: string;
  }) {
    const {
      page = 1,
      limit = 50,
      sort = 'created_at',
      order = 'DESC',
      status,
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('recording');

    queryBuilder.where('recording.deleted_at IS NULL');

    if (status) {
      queryBuilder.andWhere('recording.status = :status', { status });
    }

    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const validSortFields = ['created_at', 'updated_at', 'recorded_at', 'uploaded_at', 'status'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    queryBuilder.orderBy(`recording.${sortField}`, sortOrder);

    const totalCount = await queryBuilder.getCount();

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;

    queryBuilder.skip(skip).take(limitNum);

    const recordings = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      data: recordings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async findById(id: string) {
    return this.repository.findOne({
      where: { id, deleted_at: null },
    });
  }

  async create(data: Partial<any>) {
    const recording = this.repository.create(data);
    return this.repository.save(recording);
  }

  async update(id: string, data: Partial<any>) {
    const recording = await this.findById(id);
    if (!recording) {
      return null;
    }

    Object.assign(recording, data);
    return this.repository.save(recording);
  }

  async softDelete(id: string) {
    const recording = await this.findById(id);
    if (!recording) {
      return null;
    }

    recording.deleted_at = new Date();
    return this.repository.save(recording);
  }

  async findByVideoId(videoId: string) {
    return this.repository.findOne({
      where: { video_id: videoId, deleted_at: null },
    });
  }
}

export default new RecordingRepository();

