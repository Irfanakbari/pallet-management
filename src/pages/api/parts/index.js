import checkCookieMiddleware from "@/pages/api/middleware";
import Customer from "@/models/Customer";
import Part from "@/models/Part";
import {Op} from "sequelize";
import Vehicle from "@/models/Vehicle";

async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                if (req.user.role !== 'super' && req.user.role !== 'admin') {
                    return res.status(401).json({
                        ok: false,
                        data: "Role must be admin"
                    });
                }

                let parts;
                if (req.user.role === 'super') {
                    // Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
                    parts = await Part.findAll({
                        include: [Customer, Vehicle]
                    });
                } else if (req.user.role === 'admin') {
                    // Jika user memiliki role 'admin', tampilkan data Part dengan departemen yang sesuai
                    const allowedDepartments = req.department.map((department) => department.department_id);

                    parts = await Part.findAll({
                        include: [
                            {
                                model: Vehicle,
                                where: {
                                    '$department$': { [Op.in]: allowedDepartments }
                                }
                            },
                            {
                                model: Customer
                            }
                        ]
                    });
                }

                res.status(200).json({
                    ok: true,
                    data: parts
                });
            } catch (e) {
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error"
                });
            }
            break;

        case 'POST':
            const { name, customer, kode, vehicle } = req.body;
            try {
                if (req.user.role !== 'super' && req.user.role !== 'admin') {
                    res.status(401).json({
                        ok: false,
                        data: "Role must be admin"
                    });
                }
                const vehic = await Vehicle.findByPk(vehicle);
                await Part.create({
                    kode: customer + vehic.dataValues.department + kode,
                    name: name,
                    customer: customer,
                    vehicle: vehic.dataValues.kode
                });
                res.status(200).json({ success: true });
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    const field = error.errors[0].path;
                    const message = `Duplikat data pada kolom ${field}`;
                    res.status(400).json({ success: false, error: message });
                } else {
                    res.status(500).json({ success: false, error: error.message });
                }
            }
    }
}

const protectedAPIHandler = checkCookieMiddleware(handler);

export default protectedAPIHandler;
