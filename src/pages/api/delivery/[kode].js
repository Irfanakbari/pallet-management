import checkCookieMiddleware from "@/pages/api/middleware";
import History from "@/models/History";
import Destination from "@/models/Destination";
import Delivery from "@/models/Delivery";
import PalletDelivery from "@/models/PalletDelivery";
import Part from "@/models/Part";

async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			// if (req.user.role !== 'super' && req.user.role !== 'admin') {
			// 	return res.status(401).json({
			// 		ok: false,
			// 		data: "Role must be admin"
			// 	});
			// }
			try {
				const id = req.query.kode;
				const data = await Delivery.findOne({
					where: {
						id: id
					},include: [
						{
							model: PalletDelivery,
							include: [
								{
									model: History,
									attributes: ['id_pallet', 'destination','keluar', 'user_out']
								}
							]
						}     ,
						Part
					]
				});
				const temp = await PalletDelivery.count({
					where: {
						delivery_kode: data.id
					}
				});
				data.dataValues.isCukup = temp === data.total_pallet

				res.status(200).json({
					ok: true,
					data: data
				});
			} catch (e) {
				console.log(e.message)
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				});
			}
			break;
		case 'DELETE':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const projectId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				await Delivery.destroy({
					where: {
						id: projectId
					}
				});
				res.status(200).json({
					ok: true,
					data: "Deliveryz deleted successfully"
				});
			} catch (e) {
				
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				});
			}
			break;
		case 'PUT':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const partdId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				const newVehicle = req.body; // Anggap req.body berisi data pelanggan baru
				// const histDev = await PalletDelivery.count({
				// 	where: {
				// 		delivery_kode: partdId
				// 	}
				// })
				// const delivery = await Delivery.findOne({
				// 	where: {
				// 		id: partdId,
				// 	}
				// })
				await Delivery.update(newVehicle, {
					where: {
						id: partdId
					}
				});
				return res.status(201).json({
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
