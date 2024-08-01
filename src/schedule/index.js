/*** 
 * @Author: trexwb
 * @Date: 2024-05-13 11:30:38
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-14 15:46:58
 * @FilePath: /laboratory/application/drive/src/app/schedule/task.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */

'use strict';
const schedule = require('node-schedule');

// 每隔 10 秒钟执行一次定时任务
// 秒 分 时 日 月 周
exports.handler = function () {
  // 更新缓存任务
  // const cacheTask = require('@schedule/components/cacheTask');
  // schedule.scheduleJob('*/10 * * * * *', cacheTask);

  // 其他自定义的执行方法
  // schedule.scheduleJob('* * * * *', async function() {
  //   console.log('每1分钟执行一次');
  // });
}