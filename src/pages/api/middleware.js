import {getCookie} from "cookies-next";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import DepartmentUser from "@/models/DepartmentUsers";
import Department from "@/models/Department";

const checkCookieMiddleware = (handler) => async (req, res) => {
    const cookies = getCookie('vuteq-token', { req, res });
    // Lakukan pengecekan cookie di sini, misalnya dengan memeriksa nama cookie atau isinya
    if (!cookies) {
        // Jika cookie tidak ada atau tidak valid, kirim tanggapan error atau lakukan tindakan yang sesuai
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const decoded = jwt.verify(cookies, 'vuteqcorp');

    if (!decoded) {
        res.status(401).json({ error: 'Token Invalid' });
        return;
    }
    const user = await User.findOne({
        where: {
            id: decoded.id,
        },
        attributes:{
            exclude: ['password']
        }
    })

    req.department = await DepartmentUser.findAll({
        where: {
            user_id: decoded.id
        },
        attributes: ['department_id'],
        include: {
            model: Department,
            attributes: ['name']
        }
    })
    req.user = user

    // Jika cookie valid, lanjutkan ke handler API
    return handler(req, res);
};

export default checkCookieMiddleware