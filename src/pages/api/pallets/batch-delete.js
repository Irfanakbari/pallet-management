import Pallet from "@/models/Pallet";
import {Op} from "sequelize";
import checkCookieMiddleware from "@/pages/api/middleware";


async function handler(req, res) {
	switch (req.method) {
		case 'POST':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const {palletsToDelete} = req.body; // Array of pallet codes to delete

				await Pallet.destroy({
					where: {
						kode: {
							[Op.in]: palletsToDelete
						}
					}
				});

				res.status(200).json({success: true});

			} catch (e) {
				
				res.status(500).json({success: false, error: 'Failed to delete pallets'});
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
