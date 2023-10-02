import Customer from "@/models/Customer";
import Pallet from "@/models/Pallet";
import Vehicle from "@/models/Vehicle";
import {Op} from "sequelize";
import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";


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
				const {customer, vehicle, part, search} = req.query;
				// Menentukan parameter halaman dan batasan data
				const page = parseInt(req.query.page) || 1; // Halaman saat ini (default: 1)
				const limit = parseInt(req.query.limit); // Batasan data per halaman (default: 10)

				// Menghitung offset berdasarkan halaman dan batasan data
				const offset = (page - 1) * limit;

				let whereClause = {}; // Inisialisasi objek kosong untuk kondisi where

				if (customer) {
					whereClause = {
						...whereClause,
						'$Customer.kode$': customer,
					};
				}
				if (vehicle) {
					whereClause = {
						...whereClause,
						'$Vehicle.kode$': vehicle,
					};
				}
				if (part) {
					whereClause = {
						...whereClause,
						'$Part.kode$': part,
					};
				}
				if (search) {
					whereClause = {
						...whereClause,
						kode: {
							[Op.like]: `%${search}%`
						}
					};
				}

				if (req.user.role === 'admin' || req.user.role === 'viewer') {
					// Jika user memiliki role 'admin', tambahkan filter berdasarkan department_id
					const allowedDepartments = req.department.map((department) => department.department_id);
					whereClause['$Vehicle.department$'] = {[Op.in]: allowedDepartments};
				}

				let pallets;
				if (limit && page) {
					pallets = await Pallet.findAndCountAll({
						where: whereClause,
						include: [Vehicle, Customer, Part],
						attributes: {
							exclude: ['so']
						},
						limit,
						offset,
					});
				} else {
					pallets = await Pallet.findAndCountAll({
						where: whereClause,
						attributes: {
							exclude: ['so']
						},
						include: [Vehicle, Customer, Part],
					});
				}

				// Menghitung total halaman berdasarkan jumlah data dan batasan per halaman
				const totalData = pallets.count;

				res.status(200).json({
					ok: true,
					data: pallets.rows,
					totalData,
					limit,
					currentPage: page,
				});
			} catch (e) {
				
				res.status(500).json({
					ok: false,
					data: "Internal Server Error",
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
				const {part, name, total, jenis} = req.body;
				const parts = await Part.findOne({
					where: {
						kode: part
					}
				})
				// Dapatkan data project berdasarkan kode_project
				const vehicles = await Vehicle.findOne({
					where: {
						kode: parts.vehicle
					}
				});

				if (!vehicles) {
					return res.status(404).json({success: false, error: 'Vehicle not found'});
				}

				// Dapatkan daftar valet berdasarkan kode_project untuk mencari urutan kosong
				let pallets;
				let existingCodes = [];

				if (vehicles.department !== 'A') {
					pallets = await Pallet.findAll({where: {kode: {[Op.like]: `${jenis}-${parts.customer}${parts.vehicle}${part}%`}}});
				} else {
					pallets = await Pallet.findAll({where: {kode: {[Op.like]: `${parts.customer}${parts.vehicle}${part}%`}}});
				}

				// Mendapatkan semua kode yang sudah ada
				existingCodes = pallets.map(pallet => pallet.kode);

				const palletsToCreate = [];
				let nextId = 1;

				for (let i = 0; i < parseInt(total); i++) {
					// Mencari slot kosong dalam urutan kode
					while (existingCodes.includes(`${vehicles.department !== 'A' ? `${jenis}-${parts.customer}${parts.vehicle}${part}` : `${parts.customer}${parts.vehicle}${part}`}${nextId.toString().padStart(3, '0')}`)) {
						nextId++;
					}

					const nextIdFormatted = nextId.toString().padStart(3, '0');
					const palletKode = vehicles.department !== 'A'
						? `${jenis}-${parts.customer}${parts.vehicle}${part}${nextIdFormatted}`
						: `${parts.customer}${parts.vehicle}${part}${nextIdFormatted}`;

					palletsToCreate.push({
						kode: palletKode,
						name,
						vehicle: parts.vehicle,
						part: part,
						customer: parts.customer
					});

					nextId++;
				}
				await Pallet.bulkCreate(palletsToCreate);
				res.status(200).json({success: true});

			} catch (e) {
				
				res.status(500).json({success: false, error: 'Failed to save Pallet'});
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
