import checkCookieMiddleware from "@/pages/api/middleware";

import StokOpname from "@/models/StokOpname";

async function handler(req, res) {
	switch (req.method) {
		case 'DELETE':
			if (req.user.role !== 'super') {
				return res.status(401).json({
					ok: false,
					data: "Role must be Superadmin"
				});
			}
			try {
				const soId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				await StokOpname.destroy({
					where: {
						kode: soId
					}
				});
				res.status(200).json({
					ok: true,
					data: "SO deleted successfully"
				});
			} catch (e) {
				
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				});
			}
			break;
		case 'PUT':
			if (req.user.role !== 'super') {
				return res.status(401).json({
					ok: false,
					data: "Role must be Superadmin"
				});
			}
			try {
				const soId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				const newSo = req.body; // Anggap req.body berisi data pelanggan baru

				// Cek apakah ada StokOpname aktif
				const activeStokOpname = await StokOpname.findOne({
					where: {
						status: 1,
					},
				});

				if (activeStokOpname && newSo.status === 1) {
					// Jika ada StokOpname aktif dan Anda mencoba membuat yang baru aktif, tolak pembaruan
					return res.status(400).json({
						ok: false,
						data: "An active StokOpname already exists. You cannot create a new active one while another is active.",
					});
				}

				// Pertama-tama, jika status baru adalah aktif (1), nonaktifkan semua StokOpname yang ada
				if (newSo.status === 1) {
					await StokOpname.update(
						{status: 0, tanggal_so_closed: new Date()},
						{
							where: {
								status: 1, // Hanya nonaktifkan yang aktif
							},
						}
					);
				}

				// Selanjutnya, jika status baru adalah aktif (1), buat StokOpname baru dengan status aktif
				if (newSo.status === 1) {
					await StokOpname.update(
						{status: 1},
						{
							where: {
								kode: soId
							},
						}
					);
				} else {
					// Jika status baru adalah non-aktif (0), cukup perbarui StokOpname yang ada dengan data yang diberikan
					if (newSo.status ===0) {
						await StokOpname.update(
							{status: 0, tanggal_so_closed: new Date()},
							{
								where: {
									kode: soId,
								},
							}
						);
					}  else {
						await StokOpname.update(
							{status: 1},
							{
								where: {
									kode: soId,
								},
							}
						);
					}
				}

				res.status(201).json({
					ok: true,
					data: "Success"
				});
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
