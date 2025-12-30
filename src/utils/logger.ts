import winston from "winston";

const isServerless = process.env.VERCEL === "1";

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
];

if (!isServerless) {
  transports.push(
    new winston.transports.File({
      filename: "logs/app.log",
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports,
});

export default logger;
