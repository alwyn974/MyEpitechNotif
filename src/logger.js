const {createLogger, format, transports, config} = require("winston");
const {combine} = format;
const DailyRotateFile = require("winston-daily-rotate-file");
const pkg = require("../package.json");

let dateFormat = () => {
    let date = new Date();
    return date.toISOString().split("T")[0] + " " + date.toLocaleTimeString();
}

const customFormatter = format.printf((info) => {
    let message = `[${dateFormat()}] [${pkg.name} ${pkg.version}] [${info.level.toUpperCase()}] `
    message += typeof info.message === 'object' ? JSON.stringify(info.message, null, 2) : info.message;
    return message
});

const logger = createLogger({
    levels: config.syslog.levels,
    format: combine(format.splat(), customFormatter),
    transports: [
        new transports.Console(),
        new DailyRotateFile({
            filename: "%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            dirname: "logs"
        }).on('rotate', (oldFile, newFile) => {
            console.log("[%s-%s] Changing logging file [%s] => [%s]", pkg.name, pkg.version, oldFile, newFile);
        })
    ]
})

const error = function (err) {
    logger.error(`${err.stack || err}`);
}

module.exports = {
    logger,
    error
};