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
            if (req.user.role === 'operator') {
                return res.status(401).json({
                    ok: false,
                    data: "Operator Tidak Boleh Mengakses Halaman Ini"
                });
            }
            try {
                const {customer, vehicle, part, search} = req.query;
                // Menentukan parameter halaman dan batasan data
                const page = parseInt(req.query.page) || 1; // Halaman saat ini (default: 1)
                const limit = parseInt(req.query.limit); // Batasan data per halaman (default: 10)
                // Menghitung offset berdasarkan halaman dan batasan data
                const offset = (page - 1) * limit;


                let whereClause = {}; // Inisialisasi objek kosong untuk kondisi where

                if (customer) {
                    whereClause = {
                        ...whereClause,
                        '$Customer.kode$': customer,
                    };
                }
                if (vehicle) {
                    whereClause = {
                        ...whereClause,
                        '$Vehicle.kode$': vehicle,
                    };
                }
                if (Array.isArray(part)) {
                    whereClause = {
                        ...whereClause,
                        '$Part.kode$': {[Op.in]: part},
                    };
                }
                if (search) {
                    whereClause = {
                        ...whereClause,
                        kode: {
                            [Op.like]: `%${search}%`
                        }
                    };
                }

                const pallets = await Pallet.findAndCountAll({
                    where: {
                        ...whereClause,
                        status: 4,
                    },
                    order: [
                        [
                            'customer', 'ASC'
                        ]
                    ],
                    include: [
                        {
                            model: Customer,
                            attributes: ['name']
                        },
                        {
                            model: Vehicle,
                            attributes: ['name', 'department']
                        },
                        {
                            model: Part,
                            attributes: ['name']
                        }
                    ],
                    attributes: {
                        exclude: ['status']
                    },
                    limit,
                    offset: offset,
                });

                const totalData = pallets.count;

                res.status(200).json({
                    ok: true,
                    data: pallets.rows,
                    totalData,
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
            if (req.user.role !== 'operator') {
                return res.status(401).json({
                    ok: false,
                    data: "Role must be Operator"
                });
            }
            try {
                const {kode, target} = req.body;
                console.log(target)
                const pallet = await Pallet.findOne({
                    where: {kode: kode}
                });
                if (pallet.status === 1) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Belum di scan keluar"
                    });
                }
                if (pallet.status === 3) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sedang Dalam Status Pemeliharaan"
                    });
                }
                if (pallet.status === 4) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sudah scan transit"
                    });
                }
                await connection.transaction(async t => {
                    // const delivery = await Delivery.findByPk(delivery_kode)
                    const currentHistory = await History.findOne({
                        where: {
                            id_pallet: kode
                        },
                        order: [['keluar', 'DESC']]
                    }, {
                        transaction: t
                    })
                    if (target === 'from_vuteq') {
                        await currentHistory.update(
                            { is_transit: 1, from_vuteq: Date.now()}, {
                                transaction: t
                            }
                        );
                    }
                    if (target === 'from_cust')        {
                        await currentHistory.update(
                            { is_transit: 1, from_cust: Date.now()}, {
                                transaction: t
                            }
                        );
                    }

                    await Pallet.update(
                        {status: 4},
                        {where: {kode: kode}, transaction: t}
                    );
                    await TempHistory.create({
                        id_pallet: kode,
                        status: 'Transit In',
                        operator: req.user.username
                    }, {transaction: t})
                    // await PalletDelivery.create({
                    // 	history_kode: history.id,
                    // 	pallet_kode: pallet.kode,
                    // 	delivery_kode: delivery_kode
                    // },{transaction: t})
                })
                res.status(201).json({
                    ok: true,
                    data: "Sukses"
                });
            } catch (e) {
                // console.log(e.message);
                return res.status(500).json({
                    ok: false,
                    data: "Internal Server Error"
                });
            }
            break;
        case 'PUT':
            if (req.user.role !== 'operator') {
                return res.status(401).json({
                    ok: false,
                    data: "Role must be Operator"
                });
            }
            try {
                const {kode} = req.body;

                const pallet = await Pallet.findOne({
                    where: {kode: kode}
                });
                if (pallet.status === 0) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sudah scan keluar"
                    });
                }
                if (pallet.status === 3) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Sedang Dalam Status Pemeliharaan"
                    });
                }
                if (pallet.status === 1) {
                    return res.status(400).json({
                        ok: false,
                        data: "Pallet Belum di scan keluar"
                    });
                }
                await connection.transaction(async t => {
                    const currentHistory = await History.findOne({
                        where: {
                            id_pallet: kode
                        },
                        order: [['keluar', 'DESC']]
                    }, {
                        transaction: t
                    })
                    await currentHistory.update(
                        { is_transit: 0}, {
                            transaction: t
                        }
                    );
                    await Pallet.update(
                        {status: 0},
                        {where: {kode: kode}, transaction: t}
                    );
                    await TempHistory.create({
                        id_pallet: kode,
                        status: 'Transit Out',
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
        default:
            res.status(405).json({
                ok: false,
                data: "Method Not Allowed"
            });
    }
}

const protectedAPIHandler = checkCookieMiddleware(handler);

export default protectedAPIHandler;
