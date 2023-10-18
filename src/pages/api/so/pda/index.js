import checkCookieMiddleware from "@/pages/api/middleware";

import Pallet from "@/models/Pallet";
import Vehicle from "@/models/Vehicle";
import StokOpname from "@/models/StokOpname";
import TempHistory from "@/models/TempHistoryUser";
import connection from "@/config/database";
import DetailSO from "@/models/DetailSO";

async function handler(req, res) {
	switch (req.method) {
		case 'POST':
			if (req.user.role !== 'so') {
				return res.status(401).json({
					success: false,
					data: "Akun Ini Tidak Di Izinkan Melakukan SO"
				});
			}
			const {kode} = req.body;
			try {
				await connection.transaction(async (t) => {
					const pallet = await Pallet.findOne({
						where: {kode},
						include: [
							{model: Vehicle}
						],
						transaction: t
					});

					if (!pallet) {
						return res.status(400).json({success: false, data: 'Pallet not found'});
					}

					const so = await StokOpname.findOne({
						where: {
							status: 1
						},
						transaction: t
					});

					if (!so) {
						return res.status(400).json({
							success: false,
							data: `Tidak Ada SO Aktif`
						});
					}

					const soDetail = await DetailSO.findAll({
						where: {
							pallet_id: pallet.kode,
							so_id: so.kode,
						},
						transaction: t
					});

					if (soDetail.length >= 1) {
						return res.status(400).json({
							success: false,
							data: `Pallet Ini sudah di SO`
						});
					}

					await DetailSO.create({
						pallet_id: pallet.kode,
						so_id: so.kode,
						operator: req.user.username
					}, {transaction: t});

					await TempHistory.create({
						id_pallet: pallet.kode,
						status: 'Stock Opname',
						operator: req.user.username
					}, {transaction: t});
				});
				// Redirect ke halaman sukses atau halaman lain yang Anda inginkan
				return res.status(200).json({success: true, data: `Berhasil`});
			} catch (e) {
				res.status(500).json({success: false, data: 'Failed to stock opname'});
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
