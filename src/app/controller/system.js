/*** 
 * @Author: trexwb
 * @Date: 2024-06-17 10:12:22
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-08 11:38:20
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/controller/system.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
const status = require('@utils/status');
const logCast = require('@cast/log');


async function systemAnalysis(...args) {
  // 获取上下文
  const statusSrgs = status.getContext(args);
  const context = statusSrgs.context;
  const [appId = null] = statusSrgs.params;
  const secretsHelper = require('@helper/secrets');
  try {
    const secretRow = await secretsHelper.getAppId(appId || context.secretRow?.app_id);
    if (!secretRow?.app_id || !secretRow?.app_secret) {
      return status.error('AppId Error');
    }
    if (!secretRow?.status) {
      return status.error('AppId Status Error');
    }
    return secretRow?.extension?.['analysis'] || false;
  } catch (error) {
    logCast.writeError(__filename + ':' + error.toString());
    return false;
  }
}

module.exports = {
  systemAnalysis
};