/*** 
 * @Author: trexwb
 * @Date: 2024-01-29 08:30:58
 * @LastEditors: trexwb
 * @LastEditTime: 2024-04-09 16:06:49
 * @FilePath: /laboratory/Users/wbtrex/website/localServer/node/damei/package/node/microservice_framework/src/config/knex.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
// Update with your config settings.
// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
const alias = require('@utils/alias');

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
      min: 2,
      max: 10000 // 修改连接池最大值为10，以提高数据库性能
    },
    acquireConnectionTimeout: 600,
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
  if (connectionType === 'mysql2') {
    return {
      write: {
        ...commonConfig,
        client: process.env.DB_CONNECTION,
        connection: {
          host: process.env.DB_WRITE_HOST || '',
          user: process.env.DB_USERNAME || '',
          password: process.env.DB_PASSWORD || '',
          port: process.env.DB_WRITE_PORT || '',
          database: process.env.DB_DATABASE || '',
          timezone: process.env.TIMEZONE || '+08:00',
          charset: 'utf8mb4',
          ssl: {
            rejectUnauthorized: false
          },
        }
      },
      read: {
        ...commonConfig,
        client: process.env.DB_CONNECTION,
        connection: {
          host: process.env.DB_READ_HOST || '',
          user: process.env.DB_USERNAME || '',
          password: process.env.DB_PASSWORD || '',
          port: process.env.DB_READ_PORT || '',
          database: process.env.DB_DATABASE || '',
          timezone: process.env.TIMEZONE || '+08:00',
          charset: 'utf8mb4',
          ssl: {
            rejectUnauthorized: false
          },
        }
      }
    };
  }
  if (connectionType === 'sqlite' || connectionType === 'sqlite3') {
    return {
      write: {
        client: process.env.DB_CONNECTION || 'sqlite',
        connection: {
          filename: alias.resolve(`@resources/database/${process.env.DB_FILE || 'database.db'}`),
          prefix: process.env.DB_PREFIX || '',
          ...commonConfig
        }
      },
      read: {
        ...commonConfig,
        client: process.env.DB_CONNECTION || 'sqlite',
        connection: {
          filename: alias.resolve(`@resources/database/${process.env.DB_FILE || 'database.db'}`),
          prefix: process.env.DB_PREFIX || '',
        }
      }
    };
  }
  // 如果未识别数据库类型，则抛出错误
  throw new Error('Unsupported DB_CONNECTION type');
}
module.exports = generateConfig(process.env.DB_CONNECTION);