const { createLogger, format, transports, Logger } = require("winston")

module.exports = createLogger({
  transports: [
    new transports.Console({
      name: "debug-console",
      level: "debug",
      handleExpections: true,
      format: format.combine(
        format.timestamp({ format: "MM-DD-YY HH:mm:ss" }),
        format.align(),
        format.printf(
          (debug) => `${debug.level}: ${debug.timestamp} ${debug.message}`
        )
      ),
    }),
  ],
})
