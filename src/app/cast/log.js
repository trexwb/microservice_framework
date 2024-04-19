/*** 
 * @Author: trexwb
 * @Date: 2024-03-13 12:12:05
 * @LastEditors: trexwb
 * @LastEditTime: 2024-04-09 16:06:38
 * @FilePath: /laboratory/Users/wbtrex/website/localServer/node/damei/package/node/microservice_framework/src/app/cast/log.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
const ALY = require('aliyun-sdk');

module.exports = {
  sls: null,
  connection: function () {
    if (!this.sls) {
      this.sls = new ALY.SLS({
        accessKeyId: process.env.ALY_ACCESS_KEY_ID,
        secretAccessKey: process.env.ALY_ACCESS_KEY_SECRET,
        endpoint: process.env.ALY_SLS_ENDPOINT || 'http://cn-hangzhou.log.aliyuncs.com',
        apiVersion: '2015-06-01'
      });
    }
    return this.sls;
  },
  putLogs: function (logType, msg, data, ip) {
    if (!process.env.ALY_ACCESS_KEY_ID || process.env.ALY_ACCESS_KEY_ID == '') {
      return;
    }
    try {
      const param = {
        projectName: process.env.ALY_SLS_PROJECT_NAME,
        logStoreName: process.env.ALY_SLS_LOG_STORE_NAME,
        logGroup: {
          logs: [{
            time: Math.floor(new Date().getTime() / 1000),
            contents: [{ key: logType || 'error', value: `${msg}:${JSON.stringify(data || '')}` }]
          }],
          topic: process.env.APP_NAME,
          source: ip || '127.0.0.1'
        }
      };
      this.connection().putLogs(param, function (error) {
        if (error) {
          console.error('error:', error)
        }
      });
    } catch (error) {
      console.error(`error:`, error);
      // Here can be added error retry logic or error reporting
    }
  },
  writeError: function (msg, data, ip) {
    this.putLogs(`error[${process.env.NODE_ENV}]`, msg, data, ip);
  },
  writeInfo: function (msg, data) {
    this.putLogs(`info[${process.env.NODE_ENV}]`, msg, data);
  }
}
