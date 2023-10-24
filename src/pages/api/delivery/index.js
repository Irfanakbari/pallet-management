import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";
import {Op} from "sequelize";
import Vehicle from "@/models/Vehicle";
import Delivery from "@/models/Delivery";
import {customAlphabet} from "nanoid";
import PalletDelivery from "@/models/PalletDelivery";

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
				let counts = 0;
					let deliveries
					if (req.user.role === 'super' || req.user.role === 'operator') {
						// Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
						deliveries = await Delivery.findAll({
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
				} else if (req.user.role === 'admin' || req.user.role === 'viewer') {
					// Jika user memiliki role 'admin', tampilkan data Part dengan departemen yang sesuai
					const allowedDepartments = req.department.map((department) => department.department_id);

					deliveries = await Delivery.findAll({
						where: {
							'$Part.Vehicle.department$': {[Op.in]: allowedDepartments}
						},
						include: [
							{
								model: Part,
								include: [
									{
										model: Vehicle
									}
								]
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
				}
				res.status(200).json({
					ok: true,
					data: deliveries
				});
			} catch (e) {
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				});
			}
			break;
		case 'POST':
			if (req.user.role === 'operator') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin/super"
				});
			}
			try {
				const {kode, part, total_pallet, tujuan, sopir, no_pol, tanggal} = req.body;
				const nanoid = customAlphabet('1234567890ABCDEFGHIJK', 5);
				const soKode = "DLV-" + `${nanoid()}`;
				const dep = await Part.findOne({
					where: {
						kode: part
					}           ,
					include: [Vehicle]
				})
				await Delivery.create({
					id:  soKode,
					kode_delivery: kode,
					part: part ,
					total_pallet: parseInt(total_pallet),
					tujuan: tujuan,
					sopir: sopir,
					no_pol,
					tanggal_delivery: tanggal,
					department: dep['Vehicle']['department']
				});
				res.status(200).json({success: true});
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
