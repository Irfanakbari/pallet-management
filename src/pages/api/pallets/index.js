import Customer from "@/models/Customer";
import Pallet from "@/models/Pallet";
import Vehicle from "@/models/Vehicle";
import {Op} from "sequelize";
import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";
import logger from "@/utils/logger";

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
                const { customer, vehicle, part, search } = req.query;
                // Menentukan parameter halaman dan batasan data
                const page = parseInt(req.query.page) || 1; // Halaman saat ini (default: 1)
                const limit = parseInt(req.query.limit) || 20; // Batasan data per halaman (default: 10)

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
                if (part) {
                    whereClause = {
                        ...whereClause,
                        '$Part.kode$': part,
                    };
                }
                if (search) {
                    whereClause = {
                        ...whereClause,
                        kode: search,
                    };
                }

                if (req.user.role === 'admin' || req.user.role === 'viewer') {
                    // Jika user memiliki role 'admin', tambahkan filter berdasarkan department_id
                    const allowedDepartments = req.department.map((department) => department.department_id);
                    whereClause['$Vehicle.department$'] = { [Op.in]: allowedDepartments };
                }

                const pallets = await Pallet.findAndCountAll({
                    where: whereClause,
                    include: [Vehicle, Customer, Part],
                    limit,
                    offset,
                });

                // Menghitung total halaman berdasarkan jumlah data dan batasan per halaman
                const totalPages = Math.ceil(pallets.count / limit);

                res.status(200).json({
                    ok: true,
                    data: pallets.rows,
                    totalPages,
                    currentPage: page,
                });
            } catch (e) {
                logger.error(e.message);
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error",
                });
            }
            break;
        case 'POST':
            if (req.user.role !== 'super' && req.user.role !== 'admin') {
                res.status(401).json({
                    ok: false,
                    data: "Role must be admin"
                });
            }
            try {
                const { part, name, total } = req.body;
                const parts = await Part.findOne({
                    where: {
                        kode: part
                    }
                })
                // Dapatkan data project berdasarkan kode_project
                const vehicles = await Vehicle.findOne({
                    where: {
                        kode: parts.vehicle
                    }
                });

                if (!vehicles) {
                    return res.status(404).json({ success: false, error: 'Vehicle not found' });
                }

                // Dapatkan daftar valet berdasarkan kode_project untuk mencari urutan kosong
                const pallets = await Pallet.findAll({ where: { kode: { [Op.like]: `${parts.customer}${parts.vehicle}${part}%` } } });

                let nextId;
                if (pallets.length > 0) {
                    const palletNumbers = pallets.map(palet => {
                        const palletId = palet['kode'];
                        const numberString = palletId.slice(parts.customer.length + parts.vehicle.length + part.length);
                        return parseInt(numberString);
                    });

                    for (let i = 1; i <= pallets.length + 1; i++) {
                        if (!palletNumbers.includes(i)) {
                            nextId = i;
                            break;
                        }
                    }

                    // Jika tidak ada urutan kosong, gunakan urutan terakhir + 1
                    if (!nextId) {
                        const lastNumber = Math.max(...palletNumbers);
                        nextId = lastNumber + 1;
                    }
                } else {
                    // Jika tidak ada valet sebelumnya, gunakan urutan awal yaitu 1
                    nextId = 1;
                }

                for (let i = 0; i < total; i++) {
                    const nextIdFormatted = (nextId + i).toString().padStart(3, '0');
                    const palletKode = parts.customer + parts.vehicle + part + nextIdFormatted;

                    await Pallet.create({
                        kode: palletKode,
                        name,
                        vehicle: parts.vehicle,
                        part: part,
                        customer: parts.customer
                    });
                }

                res.status(200).json({ success: true });

            } catch (error) {
                logger.error(e.message);
                res.status(500).json({ success: false, error: 'Failed to save Pallet' });
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
