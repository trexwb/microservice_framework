/*** 
 * @Author: trexwb
 * @Date: 2024-01-29 08:30:55
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-23 17:39:34
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/secrets.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const dbInterface = require('@interface/database');
const baseModel = require('@model/base');
const secretsLogsModel = require('@model/secretsLogs');
const CastBoolean = require('@cast/boolean');
const CastDatetime = require('@cast/datetime');
const CastInteger = require('@cast/integer');
const CastJson = require('@cast/json');
const CastString = require('@cast/string');

const secretsModel = {
  $table: `${dbInterface.prefix}secrets`,// 为模型指定表名
  $primaryKey: 'id', // 默认情况下指定'id'作为表主键，也可以指定主键名
  $fillable: [
    'channel',
    'app_id',
    'permissions',
    'extension',
    'status',
    'created_at',
    'updated_at'
  ],// 定义允许添加、更新的字段白名单，不设置则无法添加数据
  $guarded: ['id'],// 定义不允许更新的字段黑名单
  $casts: {
    channel: new CastString(),
    app_id: new CastString(),
    app_secret: new CastString(),
    status: new CastInteger(),
    extension: new CastJson()
  },
  $hidden: [
    'app_secret',
    'deleted_at'
  ],
  ...baseModel,
  writeLogs: async function (result, dataRow) {
    // 新增一个辅助函数用于保存日志
    async function saveLog(relatedId, source, handle) {
      try {
        await secretsLogsModel.save({
          secret_id: relatedId,
          source: source,
          handle: handle
        });
      } catch (error) {
        throw new Error('Failed to save log:', error);
      }
    }
    // 检查result是否为数组
    if (Array.isArray(result)) {
      for (const row of result) {
        const id = row?.id || row; // 如果row有id属性则使用id，否则使用row本身作为id
        await saveLog(id, row, dataRow);
      }
    } else if (typeof result === 'number' && !isNaN(result)) { // 检查result是否为数字
      await saveLog(result, null, dataRow);
    } else { // 处理其他情况
      throw new Error('Invalid input type for result. Expected an array or a number.');
    }
  },
  update: async function (where, data) {
    if (!where) return;
    if (!data) return;
    return await baseModel.update.apply(this, [where, data, this.writeLogs]);
  },
  save: async function (data) {
    if (!data) return;
    return await baseModel.save.apply(this, [data, this.writeLogs]);
  }
}

module.exports = secretsModel;