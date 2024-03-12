const schedule = require('node-schedule');

// 定义一个定时任务
function performTask() {
  // 这里写你的定时任务逻辑
  console.log('定时任务执行时间:', new Date());
}

// 每隔 10 秒钟执行一次定时任务
schedule.scheduleJob('*/10 * * * * *', performTask);