import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";
import Vehicle from "@/models/Vehicle";
import Delivery from "@/models/Delivery";
import PalletDelivery from "@/models/PalletDelivery";
import dayjs from "dayjs";

async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			if (req.user.role !== 'operator') {
				return res.status(401).json({
					ok: false,
					data: "Selain Operator Tidak Boleh Mengakses Halaman Ini"
				});
			}
			try {
					let deliveries
						// Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
						deliveries = await Delivery.findAll({
							where: {
								'$tanggal_delivery$': dayjs().format('YYYY-MM-DD')  ,
								'$status$': null
							},
							include: [
								{
									model: Part,
									include: [
										{
											model: Vehicle
										}
									]   ,
								}
							]
						});
						for (const delivery of deliveries) {
							const temp = await PalletDelivery.count({
								where: {
									delivery_kode: delivery.id
								}
							});
							delivery.dataValues.isCukup = temp === delivery.total_pallet
						}
				res.status(200).json({
					ok: true,
					data: deliveries
				});
			} catch (e) {
				console.error(e.message)
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
