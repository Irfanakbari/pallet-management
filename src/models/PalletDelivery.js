import connection from "@/config/database";
import {DataTypes} from "sequelize";
import History from "@/models/History";

const PalletDelivery = connection.define('PalletDelivery', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    delivery_kode: {
        type: DataTypes.STRING
    },
    history_kode: {
        type: DataTypes.INTEGER
    },
}, {
    tableName: 'pallet_delivery',
    timestamps: false
});

// PalletDelivery.belongsTo(Delivery, {foreignKey: 'delivery_kode'})

PalletDelivery.belongsTo(History, {foreignKey: 'history_kode'})

export default PalletDelivery;