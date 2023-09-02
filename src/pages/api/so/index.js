import checkCookieMiddleware from "@/pages/api/middleware";
import logger from "@/utils/logger";
import StokOpname from "@/models/StokOpname";
import {customAlphabet} from "nanoid";

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
				let sos;

				// if (req.user.role === 'super') {
				// Jika user memiliki role 'super', tampilkan semua data Vehicle tanpa batasan departemen
				sos = await StokOpname.findAll();
				// }
				// else if (req.user.role === 'admin' || req.user.role === 'viewer') {
				// 	// Jika user memiliki role 'admin', tampilkan data Vehicle dengan departemen yang sesuai
				// 	const allowedDepartments = req.department.map((department) => department.department_id);
				//
				// 	sos = await StokOpname.findAll({
				// 		where: {
				// 			department: {[Op.in]: allowedDepartments}
				// 		},
				// 	});
				// }

				res.status(200).json({
					ok: true,
					data: sos
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
			if (req.user.role !== 'super') {
				return res.status(401).json({
					ok: false,
					data: "Role must be Superadmin"
				});
			}
			const {catatan} = req.body;
			try {
				const existingActiveSO = await StokOpname.findOne({
					where: {
						status: 1, // Status aktif
					},
				});

				// Buat StokOpname baru dengan status non-aktif
				const nanoid = customAlphabet('1234567890ABCDEFGHIJK', 7);
				const soKode = "SO-" + `${nanoid()}`;

				if (existingActiveSO) {
					await StokOpname.create({
						kode: soKode,
						catatan: catatan,
						created_by: req.user.username,
						status: 0, // Status non-aktif
					});
				} else {
					await StokOpname.create({
						kode: soKode,
						catatan: catatan,
						created_by: req.user.username,
						status: 1, // Status aktif
					});
				}

				res.status(200).json({success: true});
			} catch (e) {
				logger.error({
					message: e.message,
					path: req.url, // Add the path as metadata
				});
				res.status(500).json({success: false, data: 'Failed to create stock opname'});
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
