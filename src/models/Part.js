import connection from "@/config/database";
import {DataTypes} from "sequelize";
import Customer from "@/models/Customer";
import Pallet from "@/models/Pallet";
import Destination from "@/models/Destination";
import Delivery from "@/models/Delivery";


const Part = connection.define('Part', {
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
}, {
    tableName: 'parts',
    timestamps: false
});

Customer.hasMany(Part, { foreignKey: 'customer' });
Part.belongsTo(Customer, { foreignKey: 'customer' });

Part.hasMany(Pallet, { foreignKey: 'part' });
Pallet.belongsTo(Part, { foreignKey: 'part' });

Part.hasMany(Destination, { foreignKey: 'part' });
Destination.belongsTo(Part, { foreignKey: 'part' })

Delivery.belongsTo(Part, { foreignKey: 'part' });
export default Part;