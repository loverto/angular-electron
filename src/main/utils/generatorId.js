const { execSync } = require('child_process');

function getWindowsMachineId() {
    try {
        // 使用Windows的命令行工具wmic来获取硬件ID
        const hardwareId = execSync('wmic csproduct get uuid').toString().split('\n')[1].trim();
        return hardwareId;
    } catch (error) {
        console.error('无法获取Windows机器ID', error);
        return null;
    }
}

module.exports = getWindowsMachineId;
