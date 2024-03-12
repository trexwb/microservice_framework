/*** 
 * @Author: trexwb
 * @Date: 2024-01-09 08:52:32
 * @LastEditors: trexwb
 * @LastEditTime: 2024-02-01 17:05:41
 * @FilePath: /laboratory/microservice/account/src/app/cast/cache.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
const redis = require('redis');
const redisConfig = require('@config/redis');
/**
 * CACHE_DRIVER=redis
 * CACHE_HOST=172.18.0.5
 * CACHE_PASSWORD=
 * CACHE_PORT=6379
 * CACHE_DB=2
 * CACHE_PREFIX=
 */
module.exports = {
  client: null,
  create: async function () {
    if (this.client) {
      return this.client;
    }
    try {
      this.client = await redis.createClient({
        password: redisConfig.password || '',
        socket: {
          host: redisConfig.host || '',
          port: redisConfig.port || '',
        },
        database: redisConfig.db || 1,
      });
      await this.client.connect();
    } catch (err) { }
  },
  set: async function (key, value, expireTime) {
    if (!this.client) {
      await this.create();
    }
    try {
      await this.client.set(redisConfig.prefix + key, JSON.stringify(value));
      if (expireTime) {
        await this.client.expire(redisConfig.prefix + key, expireTime);
      }
    } catch (err) { }
  },
  get: async function (key) {
    if (!this.client) {
      await this.create();
    }
    try {
      const value = await this.client.get(redisConfig.prefix + key);
      return JSON.parse(value);
    } catch (err) { return false; }
  },
  del: async function (key) {
    if (!this.client) {
      await this.create();
    }
    try {
      await this.client.del(redisConfig.prefix + key);
    } catch (err) { }
  },
  setCacheWithTags: async function (tags, key, value) {
    if (!value) {
      return;
    }
    if (!this.client) {
      await this.create();
    }
    try {
      await Promise.all([
        this.client.sAdd(`${redisConfig.prefix}tag:${tags}`, redisConfig.prefix + key),
        this.client.set(redisConfig.prefix + key, JSON.stringify(value))
      ]);
    } catch (err) { }
  },
  clearCacheByTag: async function (tag) {
    if (!this.client) {
      await this.create();
    }
    try {
      const keys = await this.client.sMembers(`${redisConfig.prefix}tag:${tag}`);
      keys.forEach(async (key) => {
        await this.client.del(key);
      });
      await this.client.del(`${redisConfig.prefix}tag:${tag}`);
    } catch (err) { }
  },
  destroy: async function () {
    if (!this.client) {
      return;
    }
    try {
      await this.client.quit();
      this.client = null;
    } catch (err) { }
  }
};
