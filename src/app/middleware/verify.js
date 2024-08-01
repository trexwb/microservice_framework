/*** 
 * @Author: trexwb
 * @Date: 2024-01-12 10:57:08
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-31 10:34:04
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/middleware/verify.js
 * @Description: 
 * @一花一世界，一叶一如来
 * Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
// 
// const path = require('path');

const sanitizeInput = async (name, args, context, next) => {
  function replaceSensitiveInfo(data) {
    const sensitiveWords = ['password', 'credit card', 'social security number', '密码', '身份证', '信用卡'];
    for (let word of sensitiveWords) {
      const regex = new RegExp(word, 'gi');
      data = data.replace(regex, '******');
    }
    return data;
  }
  function sanitizeData(data) {
    if (typeof data === 'object') {
      // 如果数据是对象，则递归处理每个属性
      for (let key in data) {
        data[key] = sanitizeData(data[key]);
      }
    } else if (typeof data === 'string') {
      // 如果数据是字符串，则应用过滤器
      const xss = require('xss');
      data = xss(data); // XSS 过滤
      data = data.replace(/(^\s*)|(\s*$)/g, "").replace(/'/g, "''"); // SQL 转义单引号
      // data = path.normalize(data); // 路径规范化
      // data = replaceSensitiveInfo(data); // 敏感信息替换
    }
    return data;
  }
  if (args) {
    // 在这里对 args 进行过滤和验证
    // 例如，对每个属性应用适当的过滤器或验证器
    args = sanitizeData(args);
  }
  const result = await next(name, args, context);
  // result.then(function (result) {
  // 	console.log("after invoke:", name, args, result);
  // });
  return result;
};

const token = async (name, args, context, next) => {
  const status = require('@utils/status');
  // 获取客户端请求的Authorization Header
  const headers = context.request.headers;
  const taskHeart = headers['x-task-heart'] || false;
  if (taskHeart) {
    // 心跳检测
    return 'Success';
  }
  const secretsHelper = require('@helper/secrets');
  const appId = headers['app-id'] || false;
  const appSecret = headers['app-secret'] || false;
  const siteId = headers['site-id'] || false;
  const timeStamp = (appSecret || '').toString().substring(32) || 0;
  if (!appId || timeStamp < Math.floor(Date.now() / 1000) - (process.env.TOKEN_TIME || 1800)) {
    return status.error('AppId Not Empty');
  }
  const secretRow = await secretsHelper.getAppId(appId);
  if (!secretRow?.app_id || !secretRow?.app_secret) {
    return status.error('AppSecret Error');
  }
  if (!secretRow?.status) {
    return status.error('AppId Status Error');
  }
  const cryptTool = require('@utils/cryptTool');
  const newSecret = cryptTool.md5(cryptTool.md5(secretRow.app_id.toString() + timeStamp.toString()) + secretRow.app_secret.toString()) + timeStamp.toString();
  if (appSecret !== newSecret) {
    return status.error('AppId Secret Error');
  }
  context.secretRow = {
    siteId,
    ...secretRow
  }
  const result = await next(name, args, context);
  // result.then(function (result) {
  // 	console.log("after invoke:", name, args, result);
  // });
  return result;
};

const sign = async (name, args, context, next) => {
  if (process.env.REQUEST_ENCRYPT === 'true') {
    if (!context.secretRow) {
      const headers = context.request.headers;
      const appId = headers['app-id'] || false;
      const siteId = headers['site-id'] || false;
      const secretsHelper = require('@helper/secrets');
      const secretRow = await secretsHelper.getAppId(appId);
      context.secretRow = {
        siteId,
        ...secretRow
      }
    }
    const key = context.secretRow.app_secret || '';
    const { iv, encryptedData } = args;
    const cryptTool = require('@utils/cryptTool');
    const decryptedData = cryptTool.decrypt(encryptedData, key, iv || '');
    args = JSON.parse(JSON.stringify(decryptedData)) //Object.assign({}, decryptedData); // {...decryptedData}
  }
  const result = await next(name, args, context);
  // result.then(function (result) {
  // 	console.log("after invoke:", name, args, result);
  // });
  return result;
};

module.exports = {
  sanitizeInput,
  token,
  sign
}