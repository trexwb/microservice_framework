/*** 
 * @Author: trexwb
 * @Date: 2024-02-01 14:48:18
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-29 14:00:56
 * @FilePath: /conf/Users/wbtrex/website/localServer/node/trexwb/git/microservice_framework/index.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved.
 */
'use strict';

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
    initApp();
  }
} else {
  initApp();
}

// 计划任务
const schedule = require('@root/src/schedule/task');
schedule.handler();

// 消息消费
const queue = require('@job/queue');
queue.handler();

exports.handler = async function(event, context) {
  // console.log("event: \n" + event);
  return "Success";
};

exports.pre_stop = (context, callback) => {
  try {
    // 销毁服务前关闭数据库
    const cacheCast = require('@cast/cache');
    cacheCast.destroy();
  } catch (e) { }
  try {
    // 销毁服务前关闭数据库
    const databaseCast = require('@cast/database');
    databaseCast.destroy();
  } catch (e) { }
  callback(null, '');
}