import connection from "@/config/database";
import {DataTypes} from "sequelize";


const TempHistory = connection.define('TempHistory', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    id_pallet: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    },
    operator: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'temp_history_user',
    updatedAt: false,
    createdAt: 'timestamp'
});

export default TempHistory;