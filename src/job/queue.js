/*** 
 * @Author: trexwb
 * @Date: 2024-05-14 09:55:15
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-14 15:56:36
 * @FilePath: /laboratory/application/drive/src/job/queue.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';
const redis = require('redis');

const redisConfig = {
  host: process.env.QUEUE_HOST || '127.0.0.1',
  port: process.env.QUEUE_PORT || 6379,
  password: process.env.QUEUE_PASSWORD || '',
  db: Number(process.env.QUEUE_DB || 0)
};

module.exports = {
  client: null,
  create: async function () {
    if (!this.client) {
      try {
        this.client = await redis.createClient({
          password: redisConfig.password || '',
          socket: {
            host: redisConfig.host || '',
            port: redisConfig.port || '',
          },
          database: redisConfig.db || 0,
        });
        this.client.on('error', (error) => {
          console.error('Redis client error:', error);
          // 关闭客户端并重新抛出错误，以便于调用者可以处理
          this.destroy();
          throw error;
        });
        await this.client.connect();
      } catch (error) {
        throw error;
      }
    }
    return this.client;
  },
  /**
   * 生成消息
   * @param {*} message 
   */
  sendMessage: async function (message) {
    let client = null;
    try {
      client = await this.create();
      // await client.set('testTime', Math.floor(Date.now() / 1000));
      await client.rPush('msgQueue', message);
    } catch (error) {
      throw error; // 上层调用者可以决定是否进行重试或其他处理
    }
  },
  /**
   * 消费消息
   */
  consumeMessage: async function () {
    let client = null;
    try {
      client = await this.create();
      // console.log('testTime', await client.get('testTime'));
      const reply = await client.blPop('msgQueue', 0);
      console.log('consumeMessage:reply', reply);
      // 这里调用实际的消费逻辑
      if (reply) {
        console.log('go...', JSON.parse(reply.element || false));
        this.consumeMessage();
      }
    } catch (error) {
      console.error(`Error consuming message:`, error);
      throw error; // 上层调用者可以决定是否进行重试或其他处理
    }
  },
  destroy: async function () {
    try {
      if (this.client) {
        await this.client.quit();
      }
    } catch (error) {
      throw error;
    }
    this.client = null;
  }
}