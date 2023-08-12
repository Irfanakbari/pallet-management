import {Sequelize} from "sequelize";
import logger from "@/utils/logger";

const connection = new Sequelize('vuteq', 'root', 'habib18102002', {
    host: 'localhost' ,
    dialect: 'mysql',
    logging: false,
});

try {
    await connection.authenticate();
} catch (error) {
    logger.error(error.message);
}
export default connection