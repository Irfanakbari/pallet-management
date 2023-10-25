import connection from "@/config/database";
import {DataTypes} from "sequelize";
import History from "@/models/History";
import PalletDelivered from "@/models/PalletDelivered";
import Delivery from "@/models/Delivery";
import Pallet from "@/models/Pallet";

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
    pallet_kode: {
        type: DataTypes.STRING
    },
}, {
    tableName: 'pallet_delivery',
    timestamps: false
});

// PalletDelivery.belongsTo(Delivery, {foreignKey: 'delivery_kode'})

PalletDelivery.belongsTo(History, {foreignKey: 'history_kode'})
PalletDelivery.belongsTo(Pallet, {foreignKey: 'pallet_kode'})

PalletDelivered.belongsTo(PalletDelivery, {foreignKey: 'pallet_delivery'})
PalletDelivered.belongsTo(Delivery, {foreignKey: 'delivery_kode'})

Delivery.hasMany(PalletDelivery, {foreignKey: 'delivery_kode'})
Delivery.hasMany(PalletDelivered, {foreignKey: 'delivery_kode'})

export default PalletDelivery;