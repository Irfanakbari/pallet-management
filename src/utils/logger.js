import winston from "winston";
import {Logtail} from "@logtail/node";
import {LogtailTransport} from "@logtail/winston";


// Create a Logtail client
const logtail = new Logtail(process.env.LOGTAIL_KEY);

// Create a Winston logger - passing in the Logtail transport
const logger = winston.createLogger({
	transports: [new LogtailTransport(logtail)],
	format: winston.format.combine(
		winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
		winston.format.errors({stack: true}),
		winston.format.splat(),
		winston.format.printf(({timestamp, level, message, stack, meta}) => {
			return `[${timestamp}] ${level}: ${stack || message} ${meta ? JSON.stringify(meta) : ''}`;
		})
	),
});

export default logger;
