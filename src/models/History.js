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
    destination: {
        type: DataTypes.STRING
    },
    from_vuteq: {
        type: DataTypes.DATE
    },
    from_cust: {
        type: DataTypes.DATE
    },
    is_transit: {
        type: DataTypes.INTEGER
    },
}, {
    tableName: 'history',
    updatedAt: 'updated_at',
    createdAt: 'keluar'
});


export default History;