import connection from "@/config/database";
import {DataTypes} from "sequelize";
import * as uuid from "uuid";
import PalletDelivery from "@/models/PalletDelivery";


const Delivery = connection.define('Delivery', {
    // Model attributes are defined here
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_delivery: {
        type: DataTypes.STRING
    },
    part: {
        type: DataTypes.STRING
    },
    tujuan: {
        type: DataTypes.STRING
    },
    total_pallet: {
        type: DataTypes.INTEGER
    },
    sopir: {
        type: DataTypes.STRING
    },
    no_pol: {
        type: DataTypes.STRING
    },
    tanggal_delivery: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.BOOLEAN,
        default: 0
    }
}, {
    tableName: 'delivery',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
});

Delivery.hasMany(PalletDelivery, {foreignKey: 'delivery_kode'})

export default Delivery;