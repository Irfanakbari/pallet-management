import connection from "@/config/database";
import {DataTypes} from "sequelize";
import History from "@/models/History";
import Customer from "@/models/Customer";
import DetailSO from "@/models/DetailSO";

const Pallet = connection.define('Pallet', {
	// Model attributes are defined here
	kode: {
		type: DataTypes.STRING,
		primaryKey: true,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING
	},
	customer: {
		type: DataTypes.STRING
	},
	vehicle: {
		type: DataTypes.STRING
	},
	part: {
		type: DataTypes.STRING
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 1
	},
}, {
	tableName: 'pallets',
	createdAt: 'created_at',
	updatedAt: 'updated_at'
});

Pallet.hasMany(History, {foreignKey: 'id_pallet'});
History.belongsTo(Pallet, {foreignKey: 'id_pallet'});

Customer.hasMany(Pallet, {foreignKey: 'customer'});
Pallet.belongsTo(Customer, {foreignKey: 'customer'});

Pallet.hasMany(DetailSO, {foreignKey: 'pallet_id'});
DetailSO.belongsTo(Pallet, {foreignKey: 'pallet_id'});

export default Pallet;