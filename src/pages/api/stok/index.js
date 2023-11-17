import Pallet from "@/models/Pallet";
import Vehicle from "@/models/Vehicle";
import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";
import History from "@/models/History";
import Destination from "@/models/Destination";

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
				const {customer, department} = req.query;
				let stok;
				let whereClause = {}
				let whereclause2 = {}

				if (customer) {
					whereClause = {
						...whereClause,
						'$customer$': customer
					}
				}
				if (department) {
					whereclause2 = {
						'$department$': department
					}
					whereClause = {
						...whereClause,
						'$Vehicle.department$': department
					}
				}

				if (req.user.role === 'super') {
					// Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
					const parts = await Part.findAll({
						where: {
							...whereclause2
						},
						include: {
							model: Vehicle,
							attributes: ['department']
						}
					});

					const stokPromises = parts.map(async (part) => {
						let dataDetail = [];
						const destinasi = await Destination.findAll({
							where: {
								part: part.kode
							}
						});
						const palletCounts = {};
						palletCounts['total'] = await Pallet.count({
							where: {
								...whereClause,
								'$part$': part.kode,
							},
							include: {
								model: Vehicle,
								attributes: ['department']
							}
						})
						palletCounts['keluar'] = await Pallet.count({
							where: {
								...whereClause,
								status: 0,
								'$part$': part['kode'],
							},
							include: {
								model: Vehicle,
								attributes: ['department']
							}
						})
						palletCounts['maintenance'] = await Pallet.count({
							where: {
								...whereClause,
								status: 3,
								'$part$': part['kode'],
							},
							include: {
								model: Vehicle,
								attributes: ['department']
							}
						})
						const vuteq1 = await Pallet.findAll({
							where: {
								...whereClause,
								status: 1,
								'$part$': part['kode'],
							},
							// include: {
							// 	model: Vehicle,
							// 	attributes: ['department']
							// }
						})
						const vuteq2 = await Pallet.findAll({
							where: {
								...whereClause,
								status: 3,
								'$part$': part['kode'],
							},
							// include: {
							// 	model: Vehicle,
							// 	attributes: ['department']
							// }
						})
						dataDetail.push({
							id: 'In Vuteq',
							data: [
								{
									dest: 'Ready',
									data: vuteq1
								},
								{
									dest: 'Maintenance',
									data: vuteq2
								}
							]
						})
						const tempCust = await Promise.all(destinasi.map(async (data) => {
							const temp = await History.findAll({
								where: {
									destination: data.name,
									masuk: null
								},
								attributes: ['id_pallet', 'updated_at'],
								include: [
									{
										model: Pallet,
										where: {
											part: part['kode']
										}             ,
										attributes: []
									}
								]
							})
							return {
								dest: data.name,
								data: temp
							}
						}))
						const inOther =  await History.findAll({
							where: {
								destination: null,
								masuk: null
							},
							attributes: ['id_pallet', 'updated_at'],
							include: [
								{
									model: Pallet,
									where: {
										part: part['kode']
									},
									attributes: []
								}
							]
						})
						dataDetail.push({
							id: 'In Customer',
							data: [
								{
									dest: 'No Destination',
									data: inOther
								},
								...tempCust.filter(data=> data.data.length >0)
							]
						})
						return {
							part: `${part['kode']} - ${part['name']}`,
							Total: palletCounts.total,
							Keluar: palletCounts.keluar,
							Maintenance: palletCounts.maintenance,
							dataDetail: dataDetail
						}
					})
					stok = await Promise.all(stokPromises);

				} else if (req.user.role === 'admin' || req.user.role === 'viewer') {
					// Jika user memiliki role 'admin', tampilkan data Part dengan departemen yang sesuai
					const allowedDepartments = req.department.map((department) => department.department_id);

					const parts = await Part.findAll({
						include: {
							model: Vehicle,
							where: {
								department: allowedDepartments
							}
						},
					});
					const stokPromises = parts.map(async (part) => {
						const palletCounts = {};
						let dataDetail = [];
						const destinasi = await Destination.findAll({
							where: {
								part: part.kode
							}
						});
						palletCounts['total'] = await Pallet.count({
							where: {
								...whereClause,
								'$part$': part['kode'],
							},
							include: {
								model: Vehicle,
								attributes: ['department']
							}
						})
						palletCounts['keluar'] = await Pallet.count({
							where: {
								...whereClause,
								status: 0,
								'$part$': part['kode'],
							},
							include: {
								model: Vehicle,
								attributes: ['department']
							}
						})
						palletCounts['maintenance'] = await Pallet.count({
							where: {
								...whereClause,
								status: 3,
								'$part$': part['kode'],
							},
							include: {
								model: Vehicle,
								attributes: ['department']
							}
						})
						const vuteq1 = await Pallet.findAll({
							where: {
								...whereClause,
								status: 1,
								'$part$': part['kode'],
							},
							// include: {
							// 	model: Vehicle,
							// 	attributes: ['department']
							// }
						})
						const vuteq2 = await Pallet.findAll({
							where: {
								...whereClause,
								status: 3,
								'$part$': part['kode'],
							},
							// include: {
							// 	model: Vehicle,
							// 	attributes: ['department']
							// }
						})
						dataDetail.push({
							id: 'In Vuteq',
							data: [
								{
									dest: 'Ready',
									data: vuteq1
								},
								{
									dest: 'Maintenance',
									data: vuteq2
								}
							]
						})
						const tempCust = await Promise.all(destinasi.map(async (data) => {
							const temp = await History.findAll({
								where: {
									destination: data.name,
									masuk: null
								},
								attributes: ['id_pallet', 'updated_at'],
								include: [
									{
										model: Pallet,
										where: {
											part: part['kode']
										}             ,
										attributes: []
									}
								]
							})
							return {
								dest: data.name,
								data: temp
							}
						}))
						const inOther =  await History.findAll({
							where: {
								destination: null,
								masuk: null
							},
							attributes: ['id_pallet', 'updated_at'],
							include: [
								{
									model: Pallet,
									where: {
										part: part['kode']
									},
									attributes: []
								}
							]
						})
						dataDetail.push({
							id: 'In Customer',
							data: [
								{
									dest: 'No Destination',
									data: inOther
								},
								...tempCust.filter(data=> data.data.length >0)
							]
						})
						return {
							part: `${part['kode']} - ${part['name']}`,
							Total: palletCounts.total,
							Keluar: palletCounts.keluar,
							Maintenance: palletCounts.maintenance,
							dataDetail: dataDetail
						}
					})
					stok = await Promise.all(stokPromises);
				}
				res.status(200).json({
					ok: true,
					data: stok,
				});
			} catch (e) {
				console.log(e.message);
				res.status(500).json({
					ok: false,
					data: "Internal Server Error",
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
