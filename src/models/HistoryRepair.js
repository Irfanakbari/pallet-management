import connection from "@/config/database";
import {DataTypes} from "sequelize";


const HistoryRepair = connection.define('HistoryRepair', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pallet: {
        type: DataTypes.STRING
    },
    user_in: {
        type: DataTypes.STRING
    },
    user_out: {
        type: DataTypes.STRING
    },
    masuk: {
        type: DataTypes.DATE
    },
    keluar: {
        type: DataTypes.DATE,
    },
}, {
    tableName: 'history_repair',
    updatedAt: 'updated_at',
    createdAt: false
});


export default HistoryRepair;