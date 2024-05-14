/*** 
 * @Author: trexwb
 * @Date: 2024-01-09 09:04:23
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-13 11:47:00
 * @FilePath: /laboratory/application/drive/src/app/schedule/updateCache.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

module.exports = async function () {
  const cacheCast = require('@cast/cache');
  await cacheCast.clearCacheByTag('accounts');
  await cacheCast.clearCacheByTag('config');
  await cacheCast.clearCacheByTag('process');
  await cacheCast.clearCacheByTag('secrets');
  await cacheCast.clearCacheByTag('servers');
  await cacheCast.clearCacheByTag('sites');
  // 这里写你的定时任务逻辑
  console.log('定时任务执行时间:', new Date());
}