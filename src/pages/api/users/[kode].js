import User from "@/models/User";
import bcrypt from "bcrypt";
import checkCookieMiddleware from "@/pages/api/middleware";
import logger from "@/utils/logger";

async function handler(req, res) {
	switch (req.method) {
		case 'DELETE':
			if (req.user.role !== 'super') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const userId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				await User.destroy({
					where: {
						id: userId
					}
				});
				res.status(200).json({
					ok: true,
					data: "User deleted successfully"
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
			if (req.user.role !== 'super') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const userId = req.query.kode;
				const newUser = req.body
				const hash = bcrypt.hashSync(newUser.password, 10);
				await User.update({
					password: hash
				}, {
					where: {
						id: userId
					}
				});
				res.status(200).json({
					ok: true,
					data: "User Updated Successfully"
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
