import Pallet from "@/models/Pallet";
import {Op} from "sequelize";
import checkCookieMiddleware from "@/pages/api/middleware";
import DetailSO from "@/models/DetailSO";
import Vehicle from "@/models/Vehicle";
import Customer from "@/models/Customer";
import Part from "@/models/Part";
import StokOpname from "@/models/StokOpname";
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
				const {customer, vehicle, part, search, department, status} = req.query;
				// Menentukan parameter halaman dan batasan data
				// const page = parseInt(req.query.page) || 1; // Halaman saat ini (default: 1)
				// const limit = parseInt(req.query.limit); // Batasan data per halaman (default: 10)

				// Menghitung offset berdasarkan halaman dan batasan data
				// const offset = (page - 1) * limit;

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
				if (department) {
					whereClause = {
						...whereClause,
						'$Vehicle.department$': department,
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

				// Ambil semua data Pallet sesuai dengan filter
				const pallets = await Pallet.findAndCountAll({
					where: whereClause,
					// limit,
					// offset,
					include: [Vehicle, Customer, {
						model: Part,
					}],
				});

				const so = await StokOpname.findOne({
					where: {
						status: 1
					}
				})

				if (!so) {
					return res.status(400).json({
						ok: false,
						data: "Tidak Ada Stock Opname Aktif",
					});
				}

				// Ambil semua kode Pallet dari DetailSO
				const detailSOKodePallets = await DetailSO.findAll({
					where: {
						so_id: so.kode
					}
				});

				// Buat Set yang berisi kode Pallet yang ada di DetailSO
				const kodePalletsInDetailSO = new Set(detailSOKodePallets.map(item => item.pallet_id));

				// Tambahkan atribut 'status' ke setiap Pallet
				const palletsWithStatus = await Promise.all(pallets.rows.map(async pallet => {
					const history = await History.findAll({
						where: {
							'$id_pallet$': pallet['kode'],
						} ,
						order: [['keluar', 'DESC']], // Mengurutkan berdasarkan tanggal_keluar dari yang terbaru ke yang terlama
						limit: 5 // Membatasi hasil menjadi 5 record
					});

					return {
						...pallet.toJSON(),
						status: kodePalletsInDetailSO.has(pallet['kode']) ? 1 : 0,
						scanned_at: detailSOKodePallets.find(r => r['pallet_id'] === pallet['kode']) ?? null,
						history: history
					};
				}));
				
				// Menghitung total halaman berdasarkan jumlah data dan batasan per halaman
				// const totalData = pallets.count;

				res.status(200).json({
					ok: true,
					data: status ? palletsWithStatus.filter(pallet => pallet.status === parseInt(status)) : palletsWithStatus, // Mengganti data dengan palletsWithStatus yang telah difilter
					// totalData, // Total data keseluruhan
					// limit, // Batasan data per halaman
					// currentPage: page, // Halaman saat ini
				});

			} catch (e) {
				console.log(e.message)
				res.status(500).json({
					ok: false,
					data: "Internal Server Error",
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
