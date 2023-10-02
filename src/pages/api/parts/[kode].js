import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";


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
				await Part.destroy({
					where: {
						kode: projectId
					}
				});
				res.status(200).json({
					ok: true,
					data: "Part deleted successfully"
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
				await Part.update(newVehicle, {
					where: {
						kode: partdId
					}
				});
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
