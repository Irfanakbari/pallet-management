import jwt from "jsonwebtoken";
import {setCookie} from "cookies-next";
import User from "@/models/User";
import bcrypt from "bcrypt";
import logger from "@/utils/logger";

export default async function handler(req, res) {
    switch (req.method) {
        case 'POST':
            try {
                const credential = req.body;
                const user = await User.findOne({
                    where : {
                        username : credential.username,
                    }
                });
                if (!user) {
                    return res.status(401).json({
                        ok: false,
                        data: 'Invalid Username'
                    });
                } else {
                    const isValid = await bcrypt.compare(credential.password, user.password)
                    if (isValid) {
                        const token = jwt.sign({
                            id: user.id,
                            role: user.role
                        }, 'vuteqcorp',{ expiresIn: '1y' });
                        setCookie('@vuteq-token', token,{req, res, httpOnly: true, maxAge: 60 * 60 * 24 * 90});
                        res.status(200).json({
                            ok: true,
                            data: "Login Successfully",
                            token: token
                        });
                    } else {
                        res.status(401).json({
                            ok: false,
                            data: 'Invalid Password'
                        });
                    }
                }
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
