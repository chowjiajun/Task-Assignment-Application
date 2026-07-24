import { Sequelize } from 'sequelize';
import { config } from '../config/env.js';

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
            max: config.DATABASE_POOLING_MAX
        }
    }
);

export default sequelize;