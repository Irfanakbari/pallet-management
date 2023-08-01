import {Sequelize} from "sequelize";

const connection = new Sequelize('vuteq', 'root', 'habib18102002', {
    host: process.env.DB_HOST ?? 'localhost' ,
    dialect: 'mysql',
    // logging: msg => logger.debug(msg),
});
export default connection