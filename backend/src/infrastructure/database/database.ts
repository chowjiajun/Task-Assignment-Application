import { Sequelize } from 'sequelize';
import { config } from '../../config/env.js';

const sequelize = new Sequelize(
    config.DATABASE_NAME,
    config.DATABASE_USERNAME,
    config.DATABASE_PASSWORD,
    {
        host: config.DATABASE_HOST,
        port: config.DATABASE_PORT,
        dialect: config.DATABASE_DIALECT,
        logging: config.DATABASE_LOGGING ? console.log : false, 
        pool: {
            min: config.DATABASE_POOLING_MIN,
            max: config.DATABASE_POOLING_MAX,
            acquire: config.DATABASE_POOLING_ACQUIRE,
            idle: config.DATABASE_POOLING_IDLE
        }
    }
);

export default sequelize;