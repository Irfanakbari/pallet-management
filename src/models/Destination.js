import connection from "@/config/database";
import {DataTypes} from "sequelize";


const Destination = connection.define('Destination', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    name: {
        type: DataTypes.STRING
    },
    part: {
        type: DataTypes.STRING
    },
}, {
    tableName: 'destinations',
    timestamps: false
});


export default Destination;