import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";
import TempHistory from "@/models/TempHistoryUser";
import connection from "@/config/database";
import Customer from "@/models/Customer";
import Vehicle from "@/models/Vehicle";
import Part from "@/models/Part";

import {Op} from "sequelize";
import HistoryRepair from "@/models/HistoryRepair";
import History from "@/models/History";

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
				if (Array.isArray(part)) {
					whereClause = {
						...whereClause,
						'$Part.kode$': {[Op.in]: part},
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

				const pallets = await Pallet.findAndCountAll({
					where: {
						...whereClause,
						status: 3,
					},
					order: [
						[
							'customer', 'ASC'
						]
					],
					include: [
						{
							model: Customer,
							attributes: ['name']
						},
						{
							model: Vehicle,
							attributes: ['name', 'department']
						},
						{
							model: Part,
							attributes: ['name']
						}
					],
					attributes: {
						exclude: ['status']
					},
					limit,
					offset: offset,
				});

				const totalData = pallets.count;

				res.status(200).json({
					ok: true,
					data: pallets.rows,
					totalData,
					currentPage: parseInt(page),
				});
			} catch (e) {
				
				res.status(500).json({
					ok: false,
					data: "Internal Server Error",
				});
			}
			break;

		case 'POST':
			if (req.user.role !== 'operator') {
				return res.status(401).json({
					ok: false,
					data: "Role must be Operator"
				});
			}
			const {kode} = req.body;
			try {
				const pallet = await Pallet.findOne({
					where: {
						kode: kode
					}
				});

				if (pallet.status === 0) {
					return res.status(401).json({
						ok: false,
						data: "Pallet Sedang Diluar"
					});
				}

				if (!pallet) {
					return res.status(404).json({
						ok: false,
						data: "Pallet tidak ditemukan"
					});
				} else {
					let newStatus;
					if (pallet.status === 3) {
						newStatus = 1;
					} else {
						newStatus = 3;
					}

					await connection.transaction(async t => {
						await Pallet.update({
							status: newStatus
						}, {
							where: {
								kode: kode
							}
						}, {transaction: t});
						if (newStatus === 1) {
							await HistoryRepair.create({
								id_pallet: kode,
								user_out: req.user.username,
								keluar: Date.now(),
							})
							await TempHistory.create({
								id_pallet: kode,
								status: 'Maintenance',
								operator: req.user.username
							}, {transaction: t})
						} else if (newStatus===3) {
							const currentHistory = await HistoryRepair.findOne({
								where: {
									id_pallet: kode
								},
								order: [['keluar', 'DESC']]
							}, {
								transaction: t
							})
							await currentHistory.update({
								masuk: Date.now(),
								user_in: req.user.username
							}, {
								transaction: t
							})
							await TempHistory.create({
								id_pallet: kode,
								status: 'Out Maintenance',
								operator: req.user.username
							}, {transaction: t})
						}

					})
					res.status(200).json({
						ok: true,
						data: "Sukses"
					});
				}
			} catch (e) {
				
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				});
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
