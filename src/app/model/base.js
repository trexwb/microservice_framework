/*** 
 * @Author: trexwb
 * @Date: 2024-07-08 16:16:35
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-08 17:38:30
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/base.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';
const databaseCast = require('@cast/database');
const utils = require('@utils/index');
const logCast = require('@cast/log');
const moment = require('moment-timezone');

const DEFAULT_LIMIT = 10; // 默认分页限制
const MAX_LIMIT = 1000; // 最大分页限制
const SHANGHAI_TZ = 'Asia/Shanghai'; // 时区常量
const FORMAT = 'YYYY-MM-DD HH:mm:ss'; // 日期格式常量

// 抽象日期格式化功能
const formatDateTime = (date, timezone = SHANGHAI_TZ, format = FORMAT) => {
  return date ? moment(date).tz(timezone).format(format) : null;
};

const baseModel = {
  filterKeys: function (obj) {
    return Object.keys(obj).filter(key => !this.$hidden.includes(key)).reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
  },
  getRowOrTrashRow: async function (where, deletedAtQuery) {
    const dbRead = databaseCast.dbRead();
    try {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      const query = dbRead.select(fields)
        .from(this.$table)
        .where(where);
      // 根据是否删除来添加相应的查询条件
      if (fields.includes('deleted_at')) {
        if (deletedAtQuery) query.whereNotNull('deleted_at');
        else query.whereNull('deleted_at');
      }
      return await query.first()
        .then((row) => {
          if (row) {
            row.created_at = formatDateTime(row?.created_at, SHANGHAI_TZ, FORMAT);
            row.updated_at = formatDateTime(row?.updated_at, SHANGHAI_TZ, FORMAT);
          }
          return JSON.parse(JSON.stringify(row || false));
        })
        .catch((error) => {
          logCast.writeError(__filename + ':' + error.toString());
          return false;
        });
    } catch (error) {
      logCast.writeError(__filename + ':' + error.toString());
      return false;
    }
  },
  getRow: async function (where) {
    return await this.getRowOrTrashRow(where, false);
  },
  getTrashRow: async function (where) {
    return await this.getRowOrTrashRow(where, true);
  },
  getListOrTrashList: async function (where, order, limit, offset, deletedAtQuery) {
    const dbRead = databaseCast.dbRead();
    limit = limit > MAX_LIMIT ? MAX_LIMIT : limit || DEFAULT_LIMIT;
    order = !order ? [{ column: 'id', order: 'ASC' }] : order;
    try {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      const queryTotal = dbRead.from(this.$table).where(where);
      // 根据是否删除来添加相应的查询条件
      if (fields.includes('deleted_at')) {
        if (deletedAtQuery) queryTotal.whereNotNull('deleted_at');
        else queryTotal.whereNull('deleted_at');
      }
      const total = await queryTotal.count('id', { as: 'total' })
        .first()
        .then((row) => {
          return row.total || 0;
        }).catch(() => {
          return 0;
        });
      if (total > 0) {
        const queryRows = dbRead.from(this.$table).where(where);
        // 根据是否删除来添加相应的查询条件
        if (fields.includes('deleted_at')) {
          if (deletedAtQuery) queryRows.whereNotNull('deleted_at');
          else queryRows.whereNull('deleted_at');
        }
        if (order) queryRows.orderBy(order)
        // else queryRows.orderByRaw('if(`sort`>0,1,0) DESC,sort ASC').orderBy([{ column: 'sort', order: 'ASC' }]);
        const rows = await queryRows.select(fields)
          .limit(limit)
          .offset(offset || 0)
          .then((rows) => {
            return rows.map(row => ({
              ...row,
              created_at: formatDateTime(row?.created_at, SHANGHAI_TZ, FORMAT),
              updated_at: formatDateTime(row?.updated_at, SHANGHAI_TZ, FORMAT),
            }));
          })
          .catch((error) => {
            logCast.writeError(__filename + ':' + error.toString());
            return [];
          });
        return { total: total, list: rows };
      } else {
        return { total: 0, list: [] };
      }
    } catch (error) {
      logCast.writeError(__filename + ':' + error.toString());
      return { total: 0, list: [] };
    }
  },
  getList: async function (where, order, limit, offset) {
    return await this.getListOrTrashList(where, order, limit, offset, false);
  },
  getTrashList: async function (where, order, limit, offset) {
    return await this.getListOrTrashList(where, order, limit, offset, true);
  },
  getCount: async function (where) {
    return await this.getCountOrTrashCount(where, false);
  },
  getTrashCount: async function (where) {
    return await this.getCountOrTrashCount(where, true);
  },
  getCountOrTrashCount: async function (where, deletedAtQuery) {
    const dbRead = databaseCast.dbRead();
    try {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      const queryTotal = dbRead.from(this.$table).where(where);
      // 根据是否删除来添加相应的查询条件
      if (fields.includes('deleted_at')) {
        if (deletedAtQuery) queryTotal.whereNotNull('deleted_at');
        else queryTotal.whereNull('deleted_at');
      }
      return await queryTotal.count(this.$guarded[0] || 'id', { as: 'total' })
        .first()
        .then((row) => {
          return row.total || 0;
        }).catch(() => {
          return 0;
        });
    } catch (error) {
      logCast.writeError(__filename + ':' + error.toString());
      return 0;
    }
  },
  getAll: async function (where) {
    return await this.getALLOrTrashALL(where, false);
  },
  getTrashAll: async function (where,) {
    return await this.getALLOrTrashALL(where, true);
  },
  getALLOrTrashALL: async function (where, deletedAtQuery) {
    const dbRead = databaseCast.dbRead();
    try {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      const queryRows = dbRead.from(this.$table).where(where);
      // 根据是否删除来添加相应的查询条件
      if (fields.includes('deleted_at')) {
        if (deletedAtQuery) queryRows.whereNotNull('deleted_at');
        else queryRows.whereNull('deleted_at');
      }
      return await queryRows.select(fields)
        .where(where)
        .limit(5000)
        .offset(0)
        .then((rows) => {
          return rows.map(row => ({
            ...row,
            created_at: formatDateTime(row?.created_at, SHANGHAI_TZ, FORMAT),
            updated_at: formatDateTime(row?.updated_at, SHANGHAI_TZ, FORMAT),
          }));
        })
        .catch((error) => {
          logCast.writeError(__filename + ':' + error.toString());
          return [];
        });
    } catch (error) {
      logCast.writeError(__filename + ':' + error.toString());
      return false;
    }
  },
  update: async function (where, data) {
    if (!where || !data) return;
    const dbWrite = databaseCast.dbWrite();
    const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 过滤不存在的字段
    const dataRow = keysArray.reduce((result, key) => {
      // 确保data[key]存在且为可转换类型
      if (data.hasOwnProperty(key) && data[key] !== null && data[key] !== undefined) {
        const castType = this.$casts[key];
        if (castType === 'json') {
          result[key] = utils.safeJSONStringify(data[key]);
        } else if (castType === 'integer') {
          result[key] = utils.safeCastToInteger(data[key]);
        } else if (castType === 'datetime') {
          result[key] = data[key] ? utils.dateFormatter(data[key], 'Y-m-d H:i:s', 1, false) : null;
        } else if (data[key] !== null && data[key] !== undefined) { // 添加对 data[key] 的非空检查
          result[key] = data[key].toString();
        } else {
          delete result[key];
        }
      }
      return result;
    }, {});
    return await dbWrite(this.$table).update({ ...dataRow, updated_at: dbWrite.fn.now() }).where('id', '>', 0).where(where);
  },
  save: async function (data) {
    if (!data) return;
    const dbWrite = databaseCast.dbWrite();
    const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 这是你的键数组
    const dataRow = keysArray.reduce((result, key) => {
      // 确保data[key]存在且为可转换类型
      if (data.hasOwnProperty(key) && data[key] !== null && data[key] !== undefined) {
        const castType = this.$casts[key];
        if (castType === 'json') {
          result[key] = utils.safeJSONStringify(data[key]);
        } else if (castType === 'integer') {
          result[key] = utils.safeCastToInteger(data[key]);
        } else if (castType === 'datetime') {
          result[key] = data[key] ? utils.dateFormatter(data[key], 'Y-m-d H:i:s', 1, false) : null;
        } else if (data[key] !== null && data[key] !== undefined) { // 添加对 data[key] 的非空检查
          result[key] = data[key].toString();
        } else {
          delete result[key];
        }
      }
      return result;
    }, {});

    if (!dataRow.id) {
      return await dbWrite(this.$table).insert({ ...dataRow, created_at: dbWrite.fn.now(), updated_at: dbWrite.fn.now() });
    } else {
      try {
        return await dbWrite(this.$table).select('id').where(function () {
          this.where('id', '>', 0)
          if (Array.isArray(dataRow.id)) {
            if (dataRow.id.length > 0) this.whereIn('id', dataRow.id);
          } else {
            this.where('id', dataRow.id);
          }
        }).then(async (result) => {
          if (result.length > 0) {
            await dbWrite(this.$table).update({ ...dataRow, updated_at: dbWrite.fn.now() }).where(function () {
              this.where('id', '>', 0)
              if (Array.isArray(dataRow.id)) {
                if (dataRow.id.length > 0) this.whereIn('id', dataRow.id);
              } else {
                this.where('id', dataRow.id);
              }
            });
            return Array.isArray(dataRow.id) ? dataRow.id : [dataRow.id];
          } else {
            return await dbWrite(this.$table).insert({ ...dataRow, created_at: dbWrite.fn.now(), updated_at: dbWrite.fn.now() });
          }
        });
      } catch (error) {
        logCast.writeError(__filename + ':' + error.toString());
        return false;
      }
    }
  },
  restore: async function (where) {
    if (!where) return;
    const dbWrite = databaseCast.dbWrite();
    try {
      return await dbWrite(this.$table)
        .where(where)
        .update({
          deleted_at: null
        });
    } catch (error) {
      logCast.writeError(__filename + ':' + error.toString());
      return false;
    }
  },
  delete: async function (where) {
    if (!where) return;
    const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
    // 根据是否删除来添加相应的查询条件
    if (fields.includes('deleted_at')) {
      this.softDelete(where);
    } else {
      this.forceDelete(where);
    }
  },
  softDelete: async function (where) {
    if (!where) return;
    const dbWrite = databaseCast.dbWrite();
    try {
      return await dbWrite(this.$table)
        .where(where)
        .update({
          deleted_at: dbWrite.fn.now()
        });
    } catch (error) {
      logCast.writeError(__filename + ':' + error.toString());
      return false;
    }
  },
  forceDelete: async function (where) {
    if (!where) return;
    const dbWrite = databaseCast.dbWrite();
    try {
      return await dbWrite(this.$table).delete(where);
    } catch (error) {
      logCast.writeError(__filename + ':' + error.toString());
      return false;
    }
  }
};

module.exports = baseModel;