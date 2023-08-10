import checkCookieMiddleware from "@/pages/api/middleware";
import Department from "@/models/Department";

async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                if (req.user.role === 'operator') {
                    return res.status(401).json({
                        ok: false,
                        data: "Operator Tidak Boleh Mengakses Halaman Ini"
                    });
                }
                const departments = await Department.findAll()
                res.status(200).json({
                    ok : true,
                    data : departments
                })
            } catch (e) {
                res.status(500).json({
                    ok : false,
                    data : "Internal Server Error"
                })
            }
            break;
        case 'POST':
            try {
                if (req.user.role !== 'super') {
                    res.status(401).json({
                        ok: false,
                        data: "Role must be admin"
                    });
                }
                const newDepartment = req.body; // Anggap req.body berisi data pelanggan baru
                const department = await Department.create(newDepartment);
                res.status(201).json({
                    ok: true,
                    data: department
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
