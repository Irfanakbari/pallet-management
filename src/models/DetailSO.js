import connection from "@/config/database";
import {DataTypes} from "sequelize";

const DetailSO = connection.define('DetailSO', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	so_id: {
		type: DataTypes.STRING(100),
		allowNull: false,
	},
	pallet_id: {
		type: DataTypes.STRING(100),
		allowNull: false,
	},
	operator: {
		type: DataTypes.STRING(100),
		allowNull: false,
	},
}, {
	tableName: 'detail_so', // Nama tabel dalam database
	timestamps: false, // Nonaktifkan createdAt dan updatedAt
});

export default DetailSO;