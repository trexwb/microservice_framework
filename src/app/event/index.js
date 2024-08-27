/*** 
 * @Author: trexwb
 * @Date: 2024-07-31 09:56:19
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-31 10:09:26
 * @FilePath: /drive/src/event/index.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

eventEmitter.on('testListener', require('./listener/test'));

module.exports = eventEmitter