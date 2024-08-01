/*** 
 * @Author: trexwb
 * @Date: 2024-03-13 12:12:05
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-29 10:38:33
 * @FilePath: /laboratory/microservice/account/src/app/cast/log.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';
// log.js
const ALY = require('aliyun-sdk');

class LogService {
  constructor() {
    this.sls = null;
  }

  connection() {
    if (!this.sls) {
      if (!process.env.ALY_ACCESS_KEY_ID || !process.env.ALY_ACCESS_KEY_SECRET) {
        throw new Error('ALY_ACCESS_KEY_ID and ALY_ACCESS_KEY_SECRET must be set');
      }
      this.sls = new ALY.SLS({
        accessKeyId: process.env.ALY_ACCESS_KEY_ID,
        secretAccessKey: process.env.ALY_ACCESS_KEY_SECRET,
        endpoint: process.env.ALY_SLS_ENDPOINT || 'http://cn-hangzhou.log.aliyuncs.com',
        apiVersion: '2015-06-01'
      });
    }
    return this.sls;
  }

  async putLogs(logType, msg, data, ip) {
    try {
      if (!process.env.ALY_ACCESS_KEY_ID || process.env.ALY_ACCESS_KEY_ID == '') {
        return;
      }
      const param = {
        projectName: process.env.ALY_SLS_PROJECT_NAME,
        logStoreName: process.env.ALY_SLS_LOG_STORE_NAME,
        logGroup: {
          logs: [{
            time: Math.floor(new Date().getTime() / 1000),
            contents: [{ key: logType || 'error', value: `${msg}:${JSON.stringify(data || {})}` }]
          }],
          topic: process.env.APP_NAME,
          source: ip || '127.0.0.1'
        }
      };
      await this.connection().putLogs(param);
    } catch (error) {
      console.error(`error:`, error);
      // Here can be added error retry logic or error reporting
    }
  }

  writeError(msg, data, ip) {
    this.putLogs(`error[${process.env.NODE_ENV}]`, msg, data, ip);
  }

  writeInfo(msg, data) {
    this.putLogs(`info[${process.env.NODE_ENV}]`, msg, data);
  }
}

module.exports = new LogService();