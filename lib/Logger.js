const fs = require('fs');

function formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function KeiLog(status, description) {
    const time = formatTime(new Date());
    const logMessage = `[${time}] [${status}] ${description}\n`;
    const logDirectory = 'log';
    const logFile = `${logDirectory}/${status.toLowerCase()}.log`;

    // Check if the log directory exists, if not, create it
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    fs.appendFile(logFile, logMessage, function (err) {
        if (err) throw err;
        
        switch(status) {
            case 'INFO':
                console.log('\x1b[34m%s\x1b[0m', logMessage);  // Blue color
                break;
            case 'SUCCESS':
                console.log('\x1b[32m%s\x1b[0m', logMessage);  // Green color
                break;
            case 'ERROR':
                console.log('\x1b[31m%s\x1b[0m', logMessage);  // Red color
                break;
            case 'ACCESS':
                console.log('\x1b[33m%s\x1b[0m', logMessage);  // Yellow color
                break;
            default:
                console.log(`Log Saved to ${logFile}!`);
        }
    });
}

module.exports = {
    KeiLog
}
