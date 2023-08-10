import Customer from "@/models/Customer";
import Pallet from "@/models/Pallet";
import Vehicle from "@/models/Vehicle";
import History from "@/models/History";
import connection from "@/config/database";
import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";
import {Op} from "sequelize";
import TempHistory from "@/models/TempHistoryUser";

async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            const { customer, vehicle, page, start, end, search, part, status } = req.query;
            try {
                if (req.user.role === 'operator') {
                    return res.status(401).json({
                        ok: false,
                        data: "Operator Tidak Boleh Mengakses Halaman Ini"
                    });
                }
                let histories;
                let whereClause = {}; // Inisialisasi objek kosong untuk kondisi where


                if (customer && vehicle && part) {
                    whereClause = {
                        '$Pallet.Customer.kode$': customer,
                        '$Pallet.Vehicle.kode$': vehicle,
                        '$Pallet.Part.kode$': vehicle,
                    };
                } else if (customer) {
                    whereClause = {
                        '$Pallet.Customer.kode$': customer,
                    };
                } else if (vehicle) {
                    whereClause = {
                        '$Pallet.Vehicle.kode$': vehicle,
                    };
                } else if (part) {
                    whereClause = {
                        '$Pallet.Part.kode$': vehicle,
                    };
                } else if (search) {
                    whereClause = {
                        'id_pallet': {
                            [Op.substring]: search.toString()
                        }
                    }
                }

                if (start && end) {
                    const startDate = new Date(start);
                    startDate.setHours(0, 0, 0, 0); // Set start time to 00:00:00
                    const endDate = new Date(end);
                    endDate.setHours(23, 59, 59, 999); // Set end time to 23:59:59.999

                    whereClause = {
                        ...whereClause,
                        keluar: {
                            [Op.between]: [startDate.toISOString(), endDate.toISOString()],
                        },
                    };
                } else if (start) {
                    const startDate = new Date(start);
                    startDate.setHours(0, 0, 0, 0); // Set start time to 00:00:00

                    whereClause = {
                        ...whereClause,
                        keluar: {
                            [Op.gte]: startDate.toISOString(),
                        },
                    };
                } else if (end) {
                    const endDate = new Date(end);
                    endDate.setHours(23, 59, 59, 999); // Set end time to 23:59:59.999

                    whereClause = {
                        ...whereClause,
                        keluar: {
                            [Op.lte]: endDate.toISOString(),
                        },
                    };
                }

                // Menghitung offset berdasarkan halaman dan batasan data
                const offset = (parseInt(page || 1) - 1) * 20;

                if (req.user.role === 'super') {
                    // Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
                    histories = await History.findAndCountAll({
                        where: whereClause,
                        include: [
                            {
                                model: Pallet,
                                where: status && {
                                    status: status
                                },
                                include: [
                                    {
                                        model: Customer,
                                    },
                                    {
                                        model: Vehicle,
                                    },
                                    {
                                        model: Part,
                                    },
                                ],
                            },
                        ],
                        limit: 20,
                        offset: offset,
                    });
                } else if (req.user.role === 'admin' || req.user.role === 'viewer') {
                    // Jika user memiliki role 'admin', tampilkan data Part dengan departemen yang sesuai
                    const allowedDepartments = req.department.map((department) => department.department_id);

                    histories = await History.findAndCountAll({
                        where: {
                            ...whereClause,
                            '$Pallet.Vehicle.department$': { [Op.in]: allowedDepartments }
                        },
                        include: [
                            {
                                model: Pallet,
                                where: status && {
                                    status: status,
                                },
                                include: [
                                    {
                                        model: Customer,
                                    },
                                    {
                                        model: Vehicle,
                                    },
                                    {
                                        model: Part,
                                    },
                                ],
                            },
                        ],
                        limit: 20,
                        offset: offset,
                    });
                }

                const totalPages = Math.ceil(histories.count / parseInt(20));

                res.status(200).json({
                    ok: true,
                    data: histories.rows,
                    totalPages,
                    currentPage: parseInt(page),
                });
            } catch (e) {
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error",
                });
            }
            break;

        case 'POST':
            try {
                const { kode } = req.body;
                const pallet = await Pallet.findOne({
                    where: { kode: kode }
                });

                if (pallet.status === 0) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sedang Berada Diluar"
                    });
                }
                if (pallet.status === 3) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sedang Dalam Status Pemeliharaan"
                    });
                }
                await connection.transaction(async t => {
                    await History.create(
                        {
                            id_pallet: kode,
                            user_out: req.user.username
                        },
                        {transaction: t}
                    );
                    await Pallet.update(
                        {status: 0},
                        {where: {kode: kode}, transaction: t}
                    );
                    await TempHistory.create({
                        id_pallet: kode,
                        status: 'Keluar',
                        operator: req.user.username
                    },{transaction: t})
                    res.status(201).json({
                        ok: true,
                        data: "Sukses"
                    });
                })
            } catch (e) {
                console.log(e.message);
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error"
                });
            }
            break;
        case 'PUT':
            try {
                const { kode } = req.body;

                const pallet = await Pallet.findOne({
                    where: { kode: kode }
                });
                if (pallet.status === 1) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sudah Masuk"
                    });
                }
                if (pallet.status === 3) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sedang Dalam Status Pemeliharaan"
                    });
                }
                await connection.transaction(async t => {
                    const currentHistory = await History.findOne({
                        where: {
                            id_pallet: kode
                        },
                        order: [['keluar', 'DESC']]
                    },{
                        transaction: t
                    })
                    await currentHistory.update(
                        {masuk: Date.now(), user_in: req.user.username}, {
                            transaction: t
                        }
                    );
                    await Pallet.update(
                        {status: 1},
                        {where: {kode: kode}, transaction: t}
                    );
                    await TempHistory.create({
                        id_pallet: kode,
                        status: 'Masuk',
                        operator: req.user.username
                    }, {transaction: t})
                })

                res.status(200).json({
                    ok: true,
                    data: "Sukses"
                });
            } catch (e) {
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error"
                });
            }
            break;
    }
}

const protectedAPIHandler = checkCookieMiddleware(handler);

export default protectedAPIHandler;
