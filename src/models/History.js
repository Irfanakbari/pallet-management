import connection from "@/config/database";
import {DataTypes} from "sequelize";


const History = connection.define('History', {
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
    destination: {
        type: DataTypes.STRING
    },
    is_transit: {
        type: DataTypes.INTEGER
    },
}, {
    tableName: 'history',
    updatedAt: 'updated_at',
    createdAt: false
});


export default History;