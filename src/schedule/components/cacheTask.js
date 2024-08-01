/*** 
 * @Author: trexwb
 * @Date: 2024-01-09 09:04:23
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-14 16:05:15
 * @FilePath: /laboratory/microservice/account/src/schedule/components/cacheTask.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

module.exports = async function () {
  const cacheCast = require('@cast/cache');
  await cacheCast.clearCacheByTag('permissions');
  await cacheCast.clearCacheByTag('roles');
  await cacheCast.clearCacheByTag('secrets');
  await cacheCast.clearCacheByTag('users');
  // 这里写你的定时任务逻辑
  console.log('定时任务执行时间:', new Date());
}