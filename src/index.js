/*** 
 * @Author: trexwb
 * @Date: 2024-02-01 14:48:18
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-13 18:14:20
 * @FilePath: /laboratory/microservice/account/src/index.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
require('dotenv').config();
require('module-alias/register');

global.siteId = process.env.SITE_ID || 0;
function initApp() {
    const hprose = require("hprose");
    // 建议使用 http://0.0.0.0 可以兼容到任意服务的转发
    const server = hprose.Server.create(`${process.env.APP_URL || 'http://0.0.0.0'}:${process.env.PORT || 8000}`);

    const verifyMiddleware = require('@middleware/verify');
    // server.use(verifyMiddleware.sanitizeInput); // 安全过滤
    server.use(verifyMiddleware.token); // app校验
    server.use(verifyMiddleware.sign); // 数据加密传输

    const responseMiddleware = require('@middleware/response');
    server.use(responseMiddleware.factory);

    const routeMiddleware = require('@middleware/route');
    routeMiddleware.controller(server);

    console.log(`Server running at ${process.env.APP_URL || 'http://0.0.0.0'}:${process.env.PORT || 8000}/`);
    server.start();
}

if (process.env.MULTIPLE_PROCESSES === "true") {
    const cluster = require('cluster');
    if (cluster.isMaster) {
        // 主进程
        const os = require('os');
        const cpuCount = os.cpus().length;

        for (let i = 0; i < cpuCount; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`工作进程 ${worker.process.pid} 已退出`);
            cluster.fork();
        });
    } else {
        // 工作进程
        const server = initApp();
    }
} else {
    // 单进程模式
    const server = initApp();
}