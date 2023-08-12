import winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `[${timestamp}] ${level}: ${stack || message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'app-error.log', level: 'error' }),
    ],
});

export default logger;
