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
                        let expiresIn;

                        if (user.role === 'super') {
                            expiresIn = '2h'; // 2 jam
                        } else if (user.role === 'admin') {
                            expiresIn = '6h'; // 6 jam
                        } else if (user.role === 'viewer') {
                            expiresIn = '3d'; // 2 hari
                        } else if (user.role === 'operator') {
                            expiresIn = '1d'; // 1 hari
                        } else {
                            expiresIn = '1d'; // 1 hari
                        }

                        const token = jwt.sign({
                            id: user.id,
                            role: user.role
                        }, 'vuteqcorp', { expiresIn });

                        setCookie('vuteq-token', token, {
                            req,
                            res,
                            httpOnly: true,
                            maxAge: expiresIn === '2d' ? 60 * 60 * 48 : (expiresIn === '2h' ? 60 * 60 * 2 : (expiresIn === '6h' ? 60 * 60 * 6 : 60 * 60 * 24))
                        });


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
