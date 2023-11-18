import StokOpname from "@/models/StokOpname";
import Pallet from "@/models/Pallet";
import Vehicle from "@/models/Vehicle";
import * as sequelize from 'sequelize';
import {Op} from 'sequelize';
import DetailSO from "@/models/DetailSO";
import Part from "@/models/Part";

export default async function handler(req, res) {
	if (req.method === 'GET') {
		try {
			const stokOpname = await StokOpname.findAll();

			const formattedLaporan = await Promise.all(
				stokOpname.map(async (so) => {
					const detailSo = await DetailSO.findAll({
						where: {
							so_id: so.kode,
						},
						include: [
							{
								model: Pallet,
								include: [Vehicle, Part],
							},
						],
					});

					const departments = [
						...new Set(detailSo.map((dso) => dso.Pallet.Vehicle.department)),
					];

					const stokSistemByDepartmentAndPart = await Pallet.findAll({
						attributes: [
							[
								sequelize.fn('COUNT', sequelize.col('*')),
								'total_stok_sistem',
							],
							[sequelize.col('Vehicle.department'), 'department'],
							[sequelize.col('Part.name'), 'part'],
						],
						created_at: {
							[Op.or]: [
								null,
								{
									[Op.lte]: so.tanggal_so_closed ?? new Date()
								},
							],
						},
						include: [
							{
								model: Vehicle,
								where: {
									'$Vehicle.department$': {
										[Op.in]: departments,
									},
								},
								attributes: [],
							},
							{
								model: Part,
								attributes: [],
							},
						],
						group: [
							sequelize.col('Vehicle.department'),
							sequelize.col('Part.name'),
						],
					});

					const stokSistemMapByDepartmentAndPart = stokSistemByDepartmentAndPart.reduce(
						(map, item) => {
							const department = item.get('department');
							const part = item.get('part');
							const totalStokSistem = item.get('total_stok_sistem');

							map[department] = map[department] || {};
							map[department][part] = (map[department][part] || 0) + totalStokSistem;

							return map;
						},
						{}
					);

					const dataByDepartment = {};

					for (const dso of detailSo) {
						const department = dso.Pallet.Vehicle.department;
						const part = dso.Pallet.Part.name;

						const departmentName = `Produksi ${department}`;

						dataByDepartment[departmentName] = dataByDepartment[departmentName] || {
							total_stok_aktual: 0,
							total_di_sistem: 0,
							selisih: 0,
							data_by_part: {},
						};

						dataByDepartment[departmentName].total_stok_aktual = detailSo.filter(
							(d) => d.Pallet.Vehicle.department === department
						).length;

						dataByDepartment[departmentName].total_di_sistem = Object.values(
							stokSistemMapByDepartmentAndPart[department] || {}
						).reduce((total, count) => total + count, 0);

						dataByDepartment[departmentName].selisih =
							dataByDepartment[departmentName].total_stok_aktual -
							dataByDepartment[departmentName].total_di_sistem;

						if (!dataByDepartment[departmentName].data_by_part[part]) {
							dataByDepartment[departmentName].data_by_part[part] = {
								stok_aktual: 0,
								stok_sistem: 0,
								selisih: 0,
							};
						}

						dataByDepartment[departmentName].data_by_part[part].stok_aktual =
							detailSo.filter((d) => d.Pallet.Part.name === part).length;
						dataByDepartment[departmentName].data_by_part[part].stok_sistem =
							stokSistemMapByDepartmentAndPart[department][part] || 0;
						dataByDepartment[departmentName].data_by_part[part].selisih =
							dataByDepartment[departmentName].data_by_part[part].stok_aktual -
							dataByDepartment[departmentName].data_by_part[part].stok_sistem;
					}

					const transformedData = Object.entries(dataByDepartment).map(
						([departmentName, data]) => {
							const transformedDataByPart = Object.entries(
								data.data_by_part
							).map(([part, partData]) => ({
								part,
								stok_aktual_part: partData.stok_aktual,
								stok_sistem_part: partData.stok_sistem,
								selisih_part: partData.selisih,
							}));
							return {
								department: departmentName,
								stok_aktual_department: data.total_stok_aktual,
								stok_sistem_department: data.total_di_sistem,
								selisih_department: data.selisih,
								data: transformedDataByPart,
							};
						}
					);

					return {
						id_so: so.kode,
						catatan: so.catatan,
						tanggal_mulai: so.tanggal_so,
						tanggal_akhir: so.tanggal_so_closed,
						status: so.status === 1 ? 'Dibuka' : 'Ditutup',
						sudah_dihitung: detailSo.length,
						belum_dihitung: await Pallet.count({
							where: {
								created_at: {
									[Op.or]: [
										null,
										{
											[Op.lte]: so.tanggal_so_closed?? new Date()
										},
									],
								},
							}
						}) - detailSo.length,
						data: transformedData,
					};
				})
			);

			res.status(200).json({data: formattedLaporan.flat()});
		} catch (error) {
			console.log(error.message);
			res.status(500).json({error: 'Failed to fetch laporan stock opname'});
		}
	} else {
		res.status(405).json({error: 'Method Not Allowed'});
	}
}
