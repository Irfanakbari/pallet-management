import checkCookieMiddleware from "@/pages/api/middleware";
import Pallet from "@/models/Pallet";
import PalletDelivery from "@/models/PalletDelivery";
import connection from "@/config/database";
import PalletDelivered from "@/models/PalletDelivered";

async function handler(req, res) {
	switch (req.method) {
		case 'POST':
			if (req.user.role !== 'operator') {
				return res.status(401).json({
					ok: false,
					data: "Role must be operator"
				});
			}
			try {
				const {kode_pallet, kode_delivery} = req.body;
				await connection.transaction(async t => {
					const pallet = await Pallet.findOne({
						where: {
							kode: kode_pallet
						},
					})
					if (!pallet) {
						return res.status(400).json({
							ok: false,
							data: "Pallet Tidak Ada di Database"
						});
					}
					const palletdeliv = await PalletDelivery.findOne({
						where: {
							delivery_kode: kode_delivery,
							pallet_kode: kode_pallet
						}
					});
					if (!palletdeliv) {
						return res.status(400).json({
							ok: false,
							data: "Pallet Tidak Ada di Data Delivery Ini"
						});
					}
					await PalletDelivered.create({
						delivery_kode: kode_delivery,
						pallet_delivery: palletdeliv.id ,
						scannedBy: req.user.username
					})
					res.status(200).json({success: true});
				})
			} catch (error) {
				res.status(500).json({success: false, error: error.message});
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
