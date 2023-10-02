import Customer from "@/models/Customer";
import checkCookieMiddleware from "@/pages/api/middleware";


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
				let customers;
				customers = await Customer.findAll();
				res.status(200).json({
					ok: true,
					data: customers
				})
			} catch (e) {
				
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				})
			}
			break;
		case 'POST':
			if (req.user.role !== 'super') {
				res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const newCustomer = req.body; // Anggap req.body berisi data pelanggan baru
				const customer = await Customer.create(newCustomer);
				res.status(201).json({
					ok: true,
					data: customer
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
