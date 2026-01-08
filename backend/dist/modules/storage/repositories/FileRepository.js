import { AppDataSource } from '../../../core/config/database.js';
import { File } from '../entities/File.entity.js';
class FileRepository {
    repository = AppDataSource.getRepository(File);
    async findMany(options) {
        const { page = 1, limit = 50, sort = 'created_at', order = 'DESC', file_type, } = options;
        const queryBuilder = this.repository.createQueryBuilder('file');
        queryBuilder.where('file.deleted_at IS NULL');
        if (file_type) {
            queryBuilder.andWhere('file.file_type = :file_type', { file_type });
        }
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const validSortFields = ['created_at', 'updated_at', 'file_type', 'file_size'];
        const sortField = validSortFields.includes(sort) ? sort : 'created_at';
        queryBuilder.orderBy(`file.${sortField}`, sortOrder);
        const totalCount = await queryBuilder.getCount();
        const pageNum = Math.max(1, page);
        const limitNum = Math.min(100, Math.max(1, limit));
        const skip = (pageNum - 1) * limitNum;
        queryBuilder.skip(skip).take(limitNum);
        const files = await queryBuilder.getMany();
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        return {
            data: files,
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
    async findById(id) {
        return this.repository.findOne({
            where: { id, deleted_at: null },
        });
    }
    async create(data) {
        const file = this.repository.create(data);
        return this.repository.save(file);
    }
    async update(id, data) {
        const file = await this.findById(id);
        if (!file) {
            return null;
        }
        Object.assign(file, data);
        return this.repository.save(file);
    }
    async softDelete(id) {
        const file = await this.findById(id);
        if (!file) {
            return null;
        }
        file.deleted_at = new Date();
        return this.repository.save(file);
    }
    async findByUrl(url) {
        return this.repository.findOne({
            where: { url, deleted_at: null },
        });
    }
}
export default new FileRepository();
//# sourceMappingURL=FileRepository.js.map