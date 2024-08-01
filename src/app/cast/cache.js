/*** 
 * @Author: trexwb
 * @Date: 2024-01-09 08:52:32
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-29 11:14:23
 * @FilePath: /laboratory/microservice/account/src/app/cast/cache.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';
const redis = require('redis');
const redisConfig = require('@config/redis');
const logCast = require('@cast/log');

/**
 * Redis客户端封装，包含连接管理、设置、获取、删除缓存等操作
 */
class RedisCache {
  constructor() {
    this.client = null;
  }

  /**
   * 创建Redis连接，如果已经连接则不重复创建
   */
  async connect() {
    if (!this.client) {
      this.client = await this.createClient();
    }
    return this.client;
  }

  /**
   * 创建Redis客户端实例
   */
  async createClient() {
    try {
      return await redis.createClient({
        password: redisConfig.password || '',
        socket: {
          host: redisConfig.host || '',
          port: redisConfig.port || '',
        },
        database: redisConfig.db || 0,
      }).on('error', () => {
        this.client = null;
      }).connect();
    } catch (error) {
      logCast.writeError(`Error initializing Redis client: ${error}`);
      throw error;
    }
  }

  /**
   * 设置缓存
   */
  async set(key, value, expireTime) {
    const client = await this.connect();
    try {
      if (value) {
        await client.set(redisConfig.prefix + key, JSON.stringify(value));
        if (expireTime) {
          await client.expire(redisConfig.prefix + key, expireTime);
        }
      }
    } catch (error) {
      logCast.writeError(`Error setting Redis value: ${error}`);
    }
  }

  /**
   * 获取缓存
   */
  async get(key) {
    const client = await this.connect();
    try {
      const value = await client.get(redisConfig.prefix + key);
      return value ? JSON.parse(value) : null; // 返回null而不是false
    } catch (error) {
      logCast.writeError(`Error getting Redis value: ${error}`);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async del(key) {
    const client = await this.connect();
    try {
      await client.del(redisConfig.prefix + key);
    } catch (error) {
      logCast.writeError(`Error deleting Redis key: ${error}`);
    }
  }

  /**
   * 与标签关联的缓存设置
   */
  async setCacheWithTags(tags, key, value) {
    if (!value) return;
    const client = await this.connect();
    try {
      await Promise.all([
        client.sAdd(`${redisConfig.prefix}tag:${tags}`, redisConfig.prefix + key),
        client.set(redisConfig.prefix + key, JSON.stringify(value)),
      ]);
    } catch (error) {
      logCast.writeError(`Error setting cache with tags: ${redisConfig.prefix + key},${error}`);
    }
  }

  /**
   * 根据标签清除缓存
   */
  async clearCacheByTag(tag) {
    const client = await this.connect();
    try {
      const keys = await client.sMembers(`${redisConfig.prefix}tag:${tag}`);
      await Promise.all(keys.map(async (key) => {
        await client.del(key);
      }));
      await client.del(`${redisConfig.prefix}tag:${tag}`);
    } catch (error) {
      logCast.writeError(`Error clearing cache by tag: ${error}`);
    }
  }

  /**
   * 销毁Redis连接
   */
  async destroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        logCast.writeError(`Error destroying Redis client: ${error}`);
      } finally {
        this.client = null;
      }
    }
  }
}

module.exports = new RedisCache();