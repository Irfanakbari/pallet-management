import connection from "@/config/database";
import {DataTypes} from "sequelize";
import Customer from "@/models/Customer";


const Department = connection.define('Department', {
    // Model attributes are defined here
    kode: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'department',
    timestamps: false
});

Department.hasMany(Customer, {foreignKey: 'department'})
Customer.belongsTo(Department, {foreignKey: 'department'})

export default Department;