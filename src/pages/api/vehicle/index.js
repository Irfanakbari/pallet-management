import Vehicle from "@/models/Vehicle";
import checkCookieMiddleware from "@/pages/api/middleware";
import {Op} from "sequelize";
import Department from "@/models/Department";
import Customer from "@/models/Customer";


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
				let vehicles;

				if (req.user.role === 'super') {
					// Jika user memiliki role 'super', tampilkan semua data Vehicle tanpa batasan departemen
					vehicles = await Vehicle.findAll({
						include: [Department, Customer]
					});
				} else if (req.user.role === 'admin' || req.user.role === 'viewer') {
					// Jika user memiliki role 'admin', tampilkan data Vehicle dengan departemen yang sesuai
					const allowedDepartments = req.department.map((department) => department.department_id);

					vehicles = await Vehicle.findAll({
						where: {
							department: {[Op.in]: allowedDepartments}
						},
						include: [Customer, Department]
					});
				}

				res.status(200).json({
					ok: true,
					data: vehicles
				});
			} catch (e) {
				
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
			const {name, customer, department} = req.body;
			try {
				// Dapatkan daftar valet berdasarkan kode_project untuk mencari urutan kosong
				const vehicles = await Vehicle.findAll({where: {kode: {[Op.like]: `${customer}%`}}});

				let nextId;
				if (vehicles.length > 0) {
					const vehicleNumbers = vehicles.map(palet => {
						const vehicleId = palet['kode'];
						const numberString = vehicleId.slice(customer.length);
						return parseInt(numberString);
					});

					for (let i = 1; i <= vehicles.length + 1; i++) {
						if (!vehicleNumbers.includes(i)) {
							nextId = i;
							break;
						}
					}

					// Jika tidak ada urutan kosong, gunakan urutan terakhir + 1
					if (!nextId) {
						const lastNumber = Math.max(...vehicleNumbers);
						nextId = lastNumber + 1;
					}
				} else {
					// Jika tidak ada valet sebelumnya, gunakan urutan awal yaitu 1
					nextId = 1;
				}

				const nextIdFormatted = nextId.toString();
				const palletKode = customer + nextIdFormatted;

				await Vehicle.create({
					kode: palletKode,
					name: name,
					customer: customer,
					department: department
				});
				// Redirect ke halaman sukses atau halaman lain yang Anda inginkan
				res.status(200).json({success: true});
			} catch (e) {
				
				res.status(500).json({success: false, error: 'Failed to create line'});
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
