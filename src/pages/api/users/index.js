import User from "@/models/User";
import bcrypt from "bcrypt";
import checkCookieMiddleware from "@/pages/api/middleware";
import connection from "@/config/database";
import DepartmentUser from "@/models/DepartmentUsers";


async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			if (req.user.role !== 'super') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const users = await User.findAll({
					attributes: {
						exclude: ['password']
					},
					include: [
						{
							model: DepartmentUser,
							attributes: ['department_id'], // Include only the 'kode' attribute
						}
					]
				})
				const transformedUsers = users.map(user => {
					const departmentCodes = user['DepartmentUsers'].map(departmentUser => departmentUser.department_id);
					return {
						...user.toJSON(),
						DepartmentUsers: departmentCodes
					};
				});
				res.status(200).json({
					ok: true,
					data: transformedUsers
				})
			} catch (e) {
				
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
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
				const newUser = req.body; // Anggap req.body berisi data pelanggan baru
				const hash = bcrypt.hashSync(newUser.password, 10);

				await connection.transaction(async (t) => {
					const user = await User.create({
						username: newUser.username,
						password: hash,
						role: newUser.role
					}, {transaction: t});

					if (newUser.department) {
						// Buat array untuk menyimpan promise pembuatan DepartmentUser
						const departmentUserPromises = newUser.department.map(async (departmentId) => {
							return DepartmentUser.create({
								user_id: user.id,
								department_id: departmentId
							}, {transaction: t});
						});

						// Tunggu hingga semua promise pembuatan DepartmentUser selesai
						await Promise.all(departmentUserPromises);
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