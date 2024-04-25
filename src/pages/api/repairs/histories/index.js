import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";
import TempHistory from "@/models/TempHistoryUser";
import connection from "@/config/database";
import Customer from "@/models/Customer";
import Vehicle from "@/models/Vehicle";
import Part from "@/models/Part";

import {Op} from "sequelize";
import HistoryRepair from "@/models/HistoryRepair";

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
				const limit = parseInt(req.query.limit) || 30; // Batasan data per halaman (default: 10)
				// Menghitung offset berdasarkan halaman dan batasan data
				const offset = (page - 1) * limit;
				let histories;
				let whereClause = {}; // Inisialisasi objek kosong untuk kondisi where

				if (customer && vehicle && part) {
					whereClause = {
						'$Pallet.Customer.kode$': customer,
						'$Pallet.Vehicle.kode$': vehicle,
						'$Pallet.Part.kode$': vehicle,
					};
				} else if (customer) {
					whereClause = {
						'$Pallet.Customer.kode$': customer,
					};
				} else if (vehicle) {
					whereClause = {
						'$Pallet.Vehicle.kode$': vehicle,
					};
				} else if (part) {
					whereClause = {
						'$Pallet.Part.kode$': vehicle,
					};
				} else if (search) {
					whereClause = {
						'id_pallet': {
							[Op.substring]: search.toString()
						}
					}
				}

				if (req.user.role === 'super') {
					// Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
					histories = await HistoryRepair.findAndCountAll({
						where: whereClause,
						include: [
							{
								model: Pallet,
								where: {
									status: 3
								},
								include: [
									{
										model: Customer,
									},
									{
										model: Vehicle,
									},
									{
										model: Part,
									},
								],
							},
						],
						limit,
						order: [['keluar', 'DESC']],
						offset: offset,
					});
				} else if (req.user.role === 'admin' || req.user.role === 'viewer') {
					// Jika user memiliki role 'admin', tampilkan data Part dengan departemen yang sesuai
					const allowedDepartments = req.department.map((department) => department.department_id);

					histories = await HistoryRepair.findAndCountAll({
						where: {
							...whereClause,
							'$Pallet.Vehicle.department$': {[Op.in]: allowedDepartments}
						},
						include: [
							{
								model: Pallet,
								where: {
									status: 3
								},
								include: [
									{
										model: Customer,
									},
									{
										model: Vehicle,
									},
									{
										model: Part,
									},
								],
							},
						],
						limit,
						offset: offset,
					});
				}

				const totalData = histories.count;

				return res.status(200).json({
					ok: true,
					data: histories.rows,
					totalData,
					limit,
					currentPage: parseInt(page),
				});
			} catch (e) {
				console.log(e)
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
