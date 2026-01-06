import { AppDataSource } from '../../../core/config/database.js';
import { SensorMetric } from '../entities/SensorMetric.entity.js';
class MetricsHttpHandler {
    async createMetric(req, res) {
        try {
            const { temp_humidity, temp_pressure, humidity, pressure, pitch, roll, yaw, accel_x, accel_y, accel_z, device_id, recorded_at, } = req.body;
            const MetricRepository = AppDataSource.getRepository(SensorMetric);
            const metric = MetricRepository.create({
                temp_humidity: temp_humidity !== undefined ? parseFloat(temp_humidity) : null,
                temp_pressure: temp_pressure !== undefined ? parseFloat(temp_pressure) : null,
                humidity: humidity !== undefined ? parseFloat(humidity) : null,
                pressure: pressure !== undefined ? parseFloat(pressure) : null,
                pitch: pitch !== undefined ? parseFloat(pitch) : null,
                roll: roll !== undefined ? parseFloat(roll) : null,
                yaw: yaw !== undefined ? parseFloat(yaw) : null,
                accel_x: accel_x !== undefined ? parseFloat(accel_x) : null,
                accel_y: accel_y !== undefined ? parseFloat(accel_y) : null,
                accel_z: accel_z !== undefined ? parseFloat(accel_z) : null,
                device_id: device_id || null,
                recorded_at: recorded_at ? new Date(recorded_at) : new Date(),
            });
            const savedMetric = await MetricRepository.save(metric);
            res.status(201).json({
                message: 'Metric created successfully',
                data: savedMetric,
            });
        }
        catch (error) {
            console.error('Create metric error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async getMetrics(req, res) {
        try {
            const { page = 1, limit = 50, sort = 'created_at', order = 'DESC', device_id, start_date, end_date, } = req.query;
            const MetricRepository = AppDataSource.getRepository(SensorMetric);
            const queryBuilder = MetricRepository.createQueryBuilder('metric');
            if (device_id) {
                queryBuilder.where('metric.device_id = :device_id', { device_id });
            }
            if (start_date) {
                const startDate = new Date(start_date);
                queryBuilder.andWhere('metric.recorded_at >= :start_date', { start_date: startDate });
            }
            if (end_date) {
                const endDate = new Date(end_date);
                queryBuilder.andWhere('metric.recorded_at <= :end_date', { end_date: endDate });
            }
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            const validSortFields = [
                'created_at',
                'recorded_at',
                'temp_humidity',
                'temp_pressure',
                'humidity',
                'pressure',
            ];
            const sortField = validSortFields.includes(sort) ? sort : 'created_at';
            queryBuilder.orderBy(`metric.${sortField}`, sortOrder);
            const totalCount = await queryBuilder.getCount();
            const pageNum = Math.max(1, parseInt(page, 10));
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
            const skip = (pageNum - 1) * limitNum;
            queryBuilder.skip(skip).take(limitNum);
            const metrics = await queryBuilder.getMany();
            const totalPages = Math.ceil(totalCount / limitNum);
            const hasNextPage = pageNum < totalPages;
            const hasPrevPage = pageNum > 1;
            res.json({
                data: metrics,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalCount,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                },
            });
        }
        catch (error) {
            console.error('Get metrics error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async getMetricById(req, res) {
        try {
            const { id } = req.params;
            const MetricRepository = AppDataSource.getRepository(SensorMetric);
            const metric = await MetricRepository.findOne({ where: { id } });
            if (!metric) {
                return res.status(404).json({ error: 'Metric not found' });
            }
            res.json({ data: metric });
        }
        catch (error) {
            console.error('Get metric by ID error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async getLatestMetric(req, res) {
        try {
            const { device_id } = req.query;
            const MetricRepository = AppDataSource.getRepository(SensorMetric);
            const queryBuilder = MetricRepository.createQueryBuilder('metric');
            if (device_id) {
                queryBuilder.where('metric.device_id = :device_id', { device_id });
            }
            queryBuilder.orderBy('metric.recorded_at', 'DESC').limit(1);
            const metric = await queryBuilder.getOne();
            if (!metric) {
                return res.status(404).json({ error: 'No metrics found' });
            }
            res.json({ data: metric });
        }
        catch (error) {
            console.error('Get latest metric error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async getStatistics(req, res) {
        try {
            const { device_id, start_date, end_date } = req.query;
            const MetricRepository = AppDataSource.getRepository(SensorMetric);
            const queryBuilder = MetricRepository.createQueryBuilder('metric');
            if (device_id) {
                queryBuilder.where('metric.device_id = :device_id', { device_id });
            }
            if (start_date) {
                const startDate = new Date(start_date);
                queryBuilder.andWhere('metric.recorded_at >= :start_date', { start_date: startDate });
            }
            if (end_date) {
                const endDate = new Date(end_date);
                queryBuilder.andWhere('metric.recorded_at <= :end_date', { end_date: endDate });
            }
            const count = await queryBuilder.getCount();
            const latestQuery = queryBuilder.clone();
            const latest = await latestQuery
                .orderBy('metric.recorded_at', 'DESC')
                .limit(1)
                .getOne();
            const avgQuery = queryBuilder.clone();
            const averages = await avgQuery
                .select([
                'AVG(metric.temp_humidity) as avg_temp_humidity',
                'AVG(metric.temp_pressure) as avg_temp_pressure',
                'AVG(metric.humidity) as avg_humidity',
                'AVG(metric.pressure) as avg_pressure',
            ])
                .getRawOne();
            res.json({
                data: {
                    count,
                    latest_recorded_at: latest?.recorded_at || null,
                    averages: {
                        temp_humidity: averages?.avg_temp_humidity || null,
                        temp_pressure: averages?.avg_temp_pressure || null,
                        humidity: averages?.avg_humidity || null,
                        pressure: averages?.avg_pressure || null,
                    },
                },
            });
        }
        catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
    async deleteMetric(req, res) {
        try {
            const { id } = req.params;
            const MetricRepository = AppDataSource.getRepository(SensorMetric);
            const metric = await MetricRepository.findOne({ where: { id } });
            if (!metric) {
                return res.status(404).json({ error: 'Metric not found' });
            }
            await MetricRepository.remove(metric);
            res.json({ message: 'Metric deleted successfully' });
        }
        catch (error) {
            console.error('Delete metric error:', error);
            res.status(500).json({ error: 'Internal server error', message: error.message });
        }
    }
}
export default MetricsHttpHandler;
//# sourceMappingURL=MetricsHttpHandler.js.map