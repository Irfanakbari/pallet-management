import checkCookieMiddleware from "@/pages/api/middleware";


async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			try {
				res.status(200).json({
					ok: true,
					data: req.user,
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

