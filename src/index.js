/*** 
 * @Author: trexwb
 * @Date: 2024-02-01 14:48:18
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-12 11:30:28
 * @FilePath: /print/Users/wbtrex/website/localServer/node/damei/package/node/microservice_framework/src/index.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
require('dotenv').config();
require('module-alias/register');

const cluster = require('cluster');
const os = require('os');
global.siteId = process.env.SITE_ID || 0;

if (cluster.isMaster) {
    // 主进程
    const cpuCount = os.cpus().length;  // 获取 CPU 核心数

    // 为每个 CPU 核心创建一个工作进程
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    // 当工作进程退出时，重新启动一个新的工作进程
    cluster.on('exit', (worker, code, signal) => {
        console.log(`工作进程 ${worker.process.pid} 已退出`);
        cluster.fork();
    });
} else {
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