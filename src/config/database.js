import {Sequelize} from "sequelize";
import logger from "@/utils/logger";

const connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
	host: process.env.DB_HOST,
	dialect: 'mysql',
	logging: false,
});

try {
	await connection.authenticate();
} catch (error) {
	logger.error(error.message);
}
export default connection