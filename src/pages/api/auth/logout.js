import {deleteCookie} from "cookies-next";
import logger from "@/utils/logger";

export default async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			try {
				deleteCookie('vuteq-token', {req, res});
				res.status(200).json({
					ok: true,
					data: 'Logout Berhasil'
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
