import connection from "@/config/database";
import {DataTypes} from "sequelize";
import DetailSO from "@/models/DetailSO";


const StokOpname = connection.define('StokOpname', {
	// Model attributes are defined here
	kode: {
		type: DataTypes.STRING,
		primaryKey: true,
		allowNull: false
	},
	tanggal_so_closed: {
		type: DataTypes.DATE
	},
	catatan: {
		type: DataTypes.STRING
	},
	created_by: {
		type: DataTypes.STRING
	},
	status: {
		type: DataTypes.INTEGER
	},
}, {
	tableName: 'stock_opname',
	createdAt: 'tanggal_so',
	updatedAt: false
});

// Department.hasMany(StokOpname, {foreignKey: 'department'});
// StokOpname.belongsTo(Department, {foreignKey: 'department'});

StokOpname.hasMany(DetailSO, {foreignKey: 'so_id'});
DetailSO.belongsTo(StokOpname, {foreignKey: 'so_id'});

export default StokOpname;