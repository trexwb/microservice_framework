/*** 
 * @Author: trexwb
 * @Date: 2024-01-29 08:30:58
 * @LastEditors: trexwb
 * @LastEditTime: 2024-06-13 09:31:39
 * @FilePath: /laboratory/microservice/account/src/config/knex.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';
// Update with your config settings.
// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
const alias = require('@utils/alias');
const logCast = require('@cast/log');

// 重构代码以提高可读性和可维护性
function generateConfig(connectionType) {
  const commonConfig = {
    useNullAsDefault: true,
    migrations: {
      tableName: `${process.env.DB_PREFIX}migrations`,
      directory: './migrations',
    },
    seeds: {
      directory: './seeds'
    },
    pool: {
      min: 0,
      max: 10
    },
    acquireConnectionTimeout: 6000,
    log: {
      warn(message) {
        logCast.writeError(`[knex warn]:${message}`)
      },
      error(message) {
        logCast.writeError(`[knex error:${message}`)
      },
      deprecate(message) {
        logCast.writeError(`[knex deprecate:${message}`)
      },
      debug(message) {
        logCast.writeError(`[knex debug:${message}`)
      }
    }
  };
  if (connectionType === 'mysql' || connectionType === 'mysql2') {
    return {
      write: {
        client: process.env.DB_CONNECTION || 'mysql2',
        connection: {
          host: process.env.DB_WRITE_HOST || '',
          user: process.env.DB_USERNAME || '',
          password: process.env.DB_PASSWORD || '',
          port: process.env.DB_WRITE_PORT || '',
          database: process.env.DB_DATABASE || '',
          timezone: process.env.TIMEZONE || '+08:00',
          charset: 'utf8mb4',
          ssl: false,
        },
        ...commonConfig,
      },
      read: {
        client: process.env.DB_CONNECTION || 'mysql2',
        connection: {
          host: process.env.DB_READ_HOST || '',
          user: process.env.DB_USERNAME || '',
          password: process.env.DB_PASSWORD || '',
          port: process.env.DB_READ_PORT || '',
          database: process.env.DB_DATABASE || '',
          timezone: process.env.TIMEZONE || '+08:00',
          charset: 'utf8mb4',
          ssl: false,
        },
        ...commonConfig,
      }
    };
  }
  if (connectionType === 'sqlite' || connectionType === 'sqlite3' || connectionType === 'better-sqlite3') {
    return {
      write: {
        client: process.env.DB_CONNECTION || 'better-sqlite3',
        connection: {
          filename: alias.resolve(`@resources/database/${process.env.DB_FILE || 'database.db'}`),
          prefix: process.env.DB_PREFIX || '',
        },
        ...commonConfig,
      },
      read: {
        client: process.env.DB_CONNECTION || 'better-sqlite3',
        connection: {
          filename: alias.resolve(`@resources/database/${process.env.DB_FILE || 'database.db'}`),
          prefix: process.env.DB_PREFIX || '',
        },
        ...commonConfig,
      }
    };
  }
  // 如果未识别数据库类型，则抛出错误
  throw new Error('Unsupported DB_CONNECTION type');
}
module.exports = generateConfig(process.env.DB_CONNECTION);