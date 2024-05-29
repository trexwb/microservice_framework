/*** 
 * @Author: trexwb
 * @Date: 2024-01-15 19:58:20
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-29 10:16:40
 * @FilePath: /conf/Users/wbtrex/website/localServer/node/trexwb/git/microservice_framework/src/app/cast/database.js
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
  async destroyIfInvalid(client, isWrite = false) {
    try {
      if (client?.context?.client?.pool) {
        return client;
      } else {
        if (client) await client.destroy();
      }
      return knex(isWrite ? knexConfig.write : knexConfig.read);
    } catch (error) {
      return knex(isWrite ? knexConfig.write : knexConfig.read);
    }
  },
   // 获取写数据库连接
   async dbWrite() {
    this.clientWrite = await this.destroyIfInvalid(this.clientWrite, true);
    return this.clientWrite;
  },

  // 获取读数据库连接
  async dbRead() {
    this.clientRead = await this.destroyIfInvalid(this.clientRead, false);
    return this.clientRead;
  },
  // 销毁数据库连接
  async destroy() {
    try {
      if (this.clientWrite) await this.clientWrite.destroy();
      if (this.clientRead) await this.clientRead.destroy();
    } catch (error) {
      console.log(`Error destroying Mysql connections: ${error}`);
    } finally {
      this.clientWrite = null;
      this.clientRead = null;
    }
  }
}
