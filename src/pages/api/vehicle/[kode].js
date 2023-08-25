import Vehicle from "@/models/Vehicle";
import checkCookieMiddleware from "@/pages/api/middleware";
import logger from "@/utils/logger";

async function handler(req, res) {
	switch (req.method) {
		case 'DELETE':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const projectId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				await Vehicle.destroy({
					where: {
						kode: projectId
					}
				});
				res.status(200).json({
					ok: true,
					data: "Project deleted successfully"
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
		case 'PUT':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const customerId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				const newVehicle = req.body; // Anggap req.body berisi data pelanggan baru
				await Vehicle.update(newVehicle, {
					where: {
						kode: customerId
					}
				});
				res.status(201).json({
					ok: true,
					data: "Success"
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
		default:
			res.status(405).json({
				ok: false,
				data: "Method Not Allowed"
			});
	}
}

const protectedAPIHandler = checkCookieMiddleware(handler);
export default protectedAPIHandler;
