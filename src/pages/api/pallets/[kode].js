import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";
import logger from "@/utils/logger";

async function handler(req, res) {
    switch (req.method) {
        case 'DELETE':
            try {
                if (req.user.role !== 'super' && req.user.role !== 'admin') {
                    res.status(401).json({
                        ok: false,
                        data: "Role must be admin"
                    });
                }
                const idPallet = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
                await Pallet.destroy({
                    where: {
                        kode: idPallet
                    }
                });
                res.status(200).json({
                    ok: true,
                    data: "Valet deleted successfully"
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