import checkCookieMiddleware from "@/pages/api/middleware";
import Department from "@/models/Department";

async function handler(req, res) {
    switch (req.method) {
        case 'DELETE':
            try {
                if (req.user.role !== 'super') {
                    return res.status(401).json({
                        ok: false,
                        data: "Role must be admin"
                    });
                }
                const departmentId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
                await Department.destroy({
                    where: {
                        kode: departmentId
                    }
                });
                res.status(200).json({
                    ok: true,
                    data: "Department deleted successfully"
                });
            } catch (e) {
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error"
                });
            }
            break;
        case 'PUT':
            try {
                if (req.user.role !== 'super') {
                    return res.status(401).json({
                        ok: false,
                        data: "Role must be admin"
                    });
                }
                const departmentId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
                const newDepartment = req.body; // Anggap req.body berisi data pelanggan baru
                await Department.update(newDepartment,{
                    where: {
                        kode : departmentId
                    }
                });
                res.status(201).json({
                    ok: true,
                    data: "Success"
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
