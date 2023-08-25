import os from "os";
import osu from "node-os-utils";

export default async function getSystemLoad() {
	const cpu = osu.cpu;
	const count = cpu.count();
	const cpuUsage = await cpu.usage();
	const totalMemory = os.totalmem();
	const freeMemory = os.freemem();
	const usedMemory = totalMemory - freeMemory;
	// const uptimeInSeconds = os.uptime();
	// const uptimeInMinutes = Math.floor(uptimeInSeconds / 60);
	// const uptimeInHours = Math.floor(uptimeInMinutes / 60);
	// const uptimeInDays = Math.floor(uptimeInHours / 24);

	return {
		cpuUsage,
		cpuTotal: count,
		memoryUsage: Math.round(((usedMemory / totalMemory) * 100) * 10) / 10,
		osInfo: {
			platform: os.platform(),
			release: os.release(),
			version: os.version(),
			// uptime: {
			// 	days: uptimeInDays,
			// 	hours: uptimeInHours % 24,
			// 	minutes: uptimeInMinutes % 60,
			// 	seconds: uptimeInSeconds % 60,
			// }
		}
	};
}
