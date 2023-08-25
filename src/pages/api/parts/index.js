import checkCookieMiddleware from "@/pages/api/middleware";
import Customer from "@/models/Customer";
import Part from "@/models/Part";
import {Op} from "sequelize";
import Vehicle from "@/models/Vehicle";
import logger from "@/utils/logger";

async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			if (req.user.role === 'operator') {
				return res.status(401).json({
					ok: false,
					data: "Operator Tidak Boleh Mengakses Halaman Ini"
				});
			}
			try {
				let parts;
				if (req.user.role === 'super') {
					// Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
					parts = await Part.findAll({
						include: [Customer, Vehicle]
					});
				} else if (req.user.role === 'admin' || req.user.role === 'viewer') {
					// Jika user memiliki role 'admin', tampilkan data Part dengan departemen yang sesuai
					const allowedDepartments = req.department.map((department) => department.department_id);

					parts = await Part.findAll({
						include: [
							{
								model: Vehicle,
								where: {
									'$department$': {[Op.in]: allowedDepartments}
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
				logger.error({
					message: e.message,
					path: req.url, // Add the path as metadata
				});
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				});
			}
			break;
		case 'POST':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const {name, customer, kode, vehicle} = req.body;
				const vehic = await Vehicle.findByPk(vehicle);
				let code;
				if (vehic.dataValues.department !== 'A') {
					code = customer + vehic.dataValues.department + kode;
				} else {
					code = customer + kode;
				}
				await Part.create({
					kode: code,
					name: name,
					customer: customer,
					vehicle: vehic.dataValues.kode
				});
				res.status(200).json({success: true});
			} catch (error) {
				logger.error({
					message: e.message,
					path: req.url, // Add the path as metadata
				});
				if (error.name === 'SequelizeUniqueConstraintError') {
					const field = error.errors[0].path;
					const message = `Duplikat data pada kolom ${field}`;
					res.status(400).json({success: false, error: message});
				} else {
					res.status(500).json({success: false, error: error.message});
				}
			}
			break;
		default:
			res.status(405).json({
				ok: false,
				data: "Method Not Allowed"
			});
	}
}

const protectedAPIHandler = checkCookieMiddleware(handler);
export default protectedAPIHandler;
