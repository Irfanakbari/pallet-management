import connection from "@/config/database";
import {DataTypes} from "sequelize";
import Delivery from "@/models/Delivery";

const PalletDelivered = connection.define('PalletDelivered', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    delivery_kode: {
        type: DataTypes.STRING
    },
    pallet_delivery: {
        type: DataTypes.INTEGER
    },
    scannedBy:{
        type: DataTypes.STRING
    }
}, {
    tableName: 'pallet_delivered',
    createdAt: 'createdAt',
    updatedAt: false
});



// PalletDelivery.belongsTo(Delivery, {foreignKey: 'delivery_kode'})




export default PalletDelivered;