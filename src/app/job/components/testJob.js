/*** 
 * @Author: trexwb
 * @Date: 2024-05-14 09:55:15
 * @LastEditors: trexwb
 * @LastEditTime: 2024-06-13 11:00:20
 * @FilePath: /laboratory/microservice/account/src/job/components/testJob.js
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
  database: Number(process.env.QUEUE_DB || 0)
};

class RedisManager {
  constructor() {
    this._client = null;
  }

  async create() {
    if (!this._client) {
      try {
        const client = redis.createClient({
          password: redisConfig.password || '',
          socket: {
            host: redisConfig.host || '',
            port: redisConfig.port || '',
          },
          database: redisConfig.database || 0,
        });
        client.on('error', (error) => {
          console.error('Redis client error:', error);
          this.destroy(); // 关闭客户端并重新抛出错误，以便于调用者可以处理
          throw error;
        });
        await client.connect();
        this._client = client;
      } catch (error) {
        throw error;
      }
    }
    return this._client;
  }

  async sendMessage(message) {
    let client = await this.create();
    try {
      await client.rPush('testQueue', message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // 上层调用者可以决定是否进行重试或其他处理
    }
  }

  async consumeMessage() {
    let client = await this.create();
    while (true) { // 无限循环以持续消费
      try {
        const reply = await client.blPop('testQueue', 0);
        if (reply) {
          console.log('go...', JSON.parse(reply.element || false));
          // this.consumeMessage();
        } else {
          // 如果没有消息，则等待，避免快速重复调用blPop增加负载
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error consuming message:`, error);
      }
    }
  }

  async destroy() {
    try {
      if (this._client) {
        await this._client.quit();
      }
    } catch (error) {
      throw error;
    } finally {
      this._client = null;
    }
  }
}

module.exports = new RedisManager();