import {Sequelize} from "sequelize";


const connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT || 3306,
	dialect: 'mysql',
	logging: false,
});

try {
	await connection.authenticate();
} catch (error) {
	console.log(error)
}
export default connection