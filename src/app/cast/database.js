/*** 
 * @Author: trexwb
 * @Date: 2024-01-15 19:58:20
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-29 11:15:03
 * @FilePath: /laboratory/microservice/account/src/app/cast/database.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';
// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
const knex = require('knex');
const knexConfig = require('@config/knex');
// const logCast = require('@cast/log');

// const dbRead = knex(knexConfig.read);
// const dbWrite = knex(knexConfig.write);

module.exports = {
  clientWrite: null,
  clientRead: null,
  prefix: process.env.DB_PREFIX || '',
  // 检查并销毁无效的连接池
  destroyIfInvalid(client, isWrite = false) {
    try {
      if (client?.context?.client?.pool) {
        return client;
      } else {
        if (client) client.destroy();
      }
      return knex(isWrite ? knexConfig.write : knexConfig.read);
    } catch (error) {
      return knex(isWrite ? knexConfig.write : knexConfig.read);
    }
  },
  // 获取写数据库连接
  dbWrite() {
    this.clientWrite = this.destroyIfInvalid(this.clientWrite, true) || knex(knexConfig.write);
    return this.clientWrite;
  },

  // 获取读数据库连接
  dbRead() {
    this.clientRead = this.destroyIfInvalid(this.clientRead, false) || knex(knexConfig.read);
    return this.clientRead;
  },
  // 销毁数据库连接
  destroy() {
    try {
      if (this.clientWrite) this.clientWrite.destroy();
      if (this.clientRead) this.clientRead.destroy();
    } catch (error) {
      console.log(`Error destroying Mysql connections: ${error}`);
    } finally {
      this.clientWrite = null;
      this.clientRead = null;
    }
  }
}
