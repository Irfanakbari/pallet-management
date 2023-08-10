import Pallet from "@/models/Pallet";
import Vehicle from "@/models/Vehicle";
import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";

async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                const {customer, department} = req.query;
                if (req.user.role === 'operator') {
                    return res.status(401).json({
                        ok: false,
                        data: "Operator Tidak Boleh Mengakses Halaman Ini"
                    });
                }
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
                        '$department$' : department
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
                        include : {
                            model: Vehicle,
                            attributes: ['department']
                        }
                    });
                    const stokPromises = parts.map( async (part) => {
                        const palletCounts = {};
                        palletCounts['total'] = await Pallet.count({
                            where: {
                                ...whereClause,
                                '$part$': part.kode ,
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
                                '$part$': part.kode ,
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
                                '$part$': part.kode ,
                            },
                            include: {
                                model: Vehicle,
                                attributes: ['department']
                            }
                        })
                        return {
                            part: `${part.kode} - ${part.name}`,
                            Total: palletCounts.total,
                            Keluar:palletCounts.keluar,
                            Maintenance:palletCounts.maintenance,
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
                                '$part$': part.kode,
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
                                '$part$': part.kode,
                            },
                            include: {
                                model: Vehicle,
                                attributes: ['department']
                            }
                        })
                        return {
                            part: `${part.kode} - ${part.name}`,
                            Total: palletCounts.total,
                            Keluar: palletCounts.keluar,
                            Maintenance: palletCounts.maintenance,
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
    }
}

const protectedAPIHandler = checkCookieMiddleware(handler);

export default protectedAPIHandler;
