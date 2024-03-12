/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-02-21 15:03:23
 * @FilePath: /laboratory/microservice/account/src/config/redis.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
/*
 * @Author: trexwb
 * @Date: 2023-12-22 13:35:09
 * @LastEditors: trexwb
 * @LastEditTime: 2023-12-22 14:24:23
 * @FilePath: \applications\drive\src\config\redis.js
 * @Description: In User Settings Edit
 * 一花一世界，一叶一如来
 * Copyright (c) 2023 by 思考豆(杭州)科技有限公司, All Rights Reserved. 
 */
// Update with your config settings.
// require('dotenv').config();
// console.log(process.env);

module.exports = {
    host: process.env.CACHE_HOST || '127.0.0.1',
    port: process.env.CACHE_PORT || 6379,
    password: process.env.CACHE_PASSWORD || '',
    db: Number(process.env.CACHE_DB || 0),
    prefix: process.env.CACHE_PREFIX || ''
};
