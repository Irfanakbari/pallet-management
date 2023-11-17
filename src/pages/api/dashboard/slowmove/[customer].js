import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";
import Customer from "@/models/Customer";
import History from "@/models/History";
import {Op} from "sequelize";
import moment from "moment";
import Part from "@/models/Part";

import Vehicle from "@/models/Vehicle";

async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			if (req.user.role === 'operator') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const customer = req.query.customer;
				let datas;
				if (req.user.role === 'super') {
					datas = await History.findAll({
						where: {
							keluar: {
								[Op.lt]: moment().subtract(3, 'week').toDate(),
							},
							masuk: null
						},
						attributes: ['id_pallet','destination'],
						include: [
							{
								model: Pallet,
								where: {
									status: 0,
								},
								attributes: ['updated_at', 'part', 'name'],
								include: [
									{
										model: Customer,
										where: {
											name: customer
										}
									},
									{
										model: Part,
										attributes: ['name']
									},
								]
							}
						],
					});
				} else {
					const allowedDepartments = req.department.map((department) => department.department_id);
					datas = await History.findAll({
						where: {
							keluar: {
								[Op.lt]: moment().subtract(3, 'week').toDate(),
							},
							masuk: null
						},
						include: [
							{
								model: Pallet,
								where: {
									status: 0,
								},
								// attributes: ['updated_at','part','name', 'Vehicle'],
								include: [
									{
										model: Customer,
										where: {
											name: customer
										}
									},
									{
										model: Part,
										attributes: ['name']
									},
									{
										model: Vehicle,
										attributes: [],
										where: {
											department: {[Op.in]: allowedDepartments}, // Filter berdasarkan department_id
										},
									}
								]
							}
						],
					});
				}
				res.status(200).json({
					data: datas
				});
			} catch (e) {
				console.log(e.message)
				res.status(500).json({error: 'Internal Server Error'});
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
