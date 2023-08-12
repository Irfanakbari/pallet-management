import checkCookieMiddleware from "@/pages/api/middleware";
import Department from "@/models/Department";
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
                const departments = await Department.findAll()
                res.status(200).json({
                    ok : true,
                    data : departments
                })
            } catch (e) {
                logger.error(e.message);
                res.status(500).json({
                    ok : false,
                    data : "Internal Server Error"
                })
            }
            break;
        case 'POST':
            if (req.user.role !== 'super') {
                return res.status(401).json({
                    ok: false,
                    data: "Role must be admin"
                });
            }
            try {
                const newDepartment = req.body; // Anggap req.body berisi data pelanggan baru
                const department = await Department.create(newDepartment);
                res.status(201).json({
                    ok: true,
                    data: department
                });
            } catch (e) {
                logger.error(e.message);
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
