/*** 
 * @Author: trexwb
 * @Date: 2024-08-27 12:06:49
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-27 12:06:50
 * @FilePath: //microservice_framework/src/app/model/base.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
/*** 
 * @Author: trexwb
 * @Date: 2024-07-17 15:50:46
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-26 17:39:45
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/base.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */

'use strict';
const dbInterface = require('@interface/database');
const utils = require('@utils/index');
const logInterface = require('@interface/log');
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
  getRowOrTrashRow: async function (where, order, deletedAtQuery) {
    const dbRead = dbInterface.dbRead();
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
      if (order) {
        query.orderBy(order);
      } else if (fields.includes('sort')) {
        query.orderByRaw('if(`sort`>0,1,0) DESC,sort ASC').orderBy([{ column: 'sort', order: 'ASC' }]);
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
          logInterface.writeError(__filename + ':' + error.toString());
          return false;
        });
    } catch (error) {
      logInterface.writeError(__filename + ':' + error.toString());
      return false;
    }
  },
  getRow: async function (where, order) {
    return await this.getRowOrTrashRow(where, order, false);
  },
  getTrashRow: async function (where, order) {
    return await this.getRowOrTrashRow(where, order, true);
  },
  getListOrTrashList: async function (where, order, limit, offset, deletedAtQuery) {
    const dbRead = dbInterface.dbRead();
    limit = limit > MAX_LIMIT ? MAX_LIMIT : limit || DEFAULT_LIMIT;
    order = !order ? [{ column: this.$primaryKey || 'id', order: 'ASC' }] : order;
    try {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      const queryTotal = dbRead.from(this.$table).where(where);
      // 根据是否删除来添加相应的查询条件
      if (fields.includes('deleted_at')) {
        if (deletedAtQuery) queryTotal.whereNotNull('deleted_at');
        else queryTotal.whereNull('deleted_at');
      }
      const total = await queryTotal.count(this.$primaryKey || 'id', { as: 'total' })
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
        if (order) {
          queryRows.orderBy(order);
        } else if (fields.includes('sort')) {
          queryRows.orderByRaw('if(`sort`>0,1,0) DESC,sort ASC').orderBy([{ column: 'sort', order: 'ASC' }]);
        }
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
            logInterface.writeError(__filename + ':' + error.toString());
            return [];
          });
        return { total: total, list: rows };
      } else {
        return { total: 0, list: [] };
      }
    } catch (error) {
      logInterface.writeError(__filename + ':' + error.toString());
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
    const dbRead = dbInterface.dbRead();
    try {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      const queryTotal = dbRead.from(this.$table).where(where);
      // 根据是否删除来添加相应的查询条件
      if (fields.includes('deleted_at')) {
        if (deletedAtQuery) queryTotal.whereNotNull('deleted_at');
        else queryTotal.whereNull('deleted_at');
      }
      return await queryTotal.count(this.$primaryKey || 'id', { as: 'total' })
        .first()
        .then((row) => {
          return row.total || 0;
        }).catch(() => {
          return 0;
        });
    } catch (error) {
      logInterface.writeError(__filename + ':' + error.toString());
      return 0;
    }
  },
  getAll: async function (where, order) {
    return await this.getALLOrTrashALL(where, order, false);
  },
  getTrashAll: async function (where, order) {
    return await this.getALLOrTrashALL(where, order, true);
  },
  getALLOrTrashALL: async function (where, order, deletedAtQuery) {
    const dbRead = dbInterface.dbRead();
    try {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      const queryRows = dbRead.from(this.$table).where(where);
      // 根据是否删除来添加相应的查询条件
      if (fields.includes('deleted_at')) {
        if (deletedAtQuery) queryRows.whereNotNull('deleted_at');
        else queryRows.whereNull('deleted_at');
      }
      if (order) {
        queryRows.orderBy(order);
      } else if (fields.includes('sort')) {
        queryRows.orderByRaw('if(`sort`>0,1,0) DESC,sort ASC').orderBy([{ column: 'sort', order: 'ASC' }]);
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
          logInterface.writeError(__filename + ':' + error.toString());
          return [];
        });
    } catch (error) {
      logInterface.writeError(__filename + ':' + error.toString());
      return false;
    }
  },
  update: async function (where, data, writeLogs = null) {
    if (!where || !data) return;
    const dbWrite = dbInterface.dbWrite();
    const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 过滤不存在的字段
    const dataRow = keysArray.reduce((result, key) => {
      // 检查data对象是否具有当前键，并且该键对应的值不为空或未定义
      if (data.hasOwnProperty(key) && data[key] !== undefined) {
        // 获取当前键对应的转换类型（如果定义了的话）
        const castType = this.$casts[key];
        // 如果转换类型存在，则使用set方法对数据进行转换并赋值给结果对象
        if (castType) {
          result[key] = castType.set(data[key]);
        } else {
          // 如果没有定义转换类型，且值不为空或未定义，则将其转换为字符串后赋值给结果对象
          result[key] = data[key].toString();
        }
      }
      // 返回累积的结果对象
      return result;
    }, {});
    if (writeLogs) {
      const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
      return await dbWrite(this.$table).select(fields).where(where).then(async (result) => {
        if (result.length > 0) {
          await dbWrite(this.$table).update({ ...dataRow, updated_at: dbWrite.fn.now() }).where(where).then(async () => {
            if (result && writeLogs) await writeLogs(result, dataRow);
          }).catch((error) => {
            throw __filename + ':' + error.toString();
          });
          return result.map(item => item.id);
        }
      });
    } else {
      return await dbWrite(this.$table).update({ ...dataRow, updated_at: dbWrite.fn.now() }).where(where);
    }
  },
  save: async function (data, writeLogs = null) {
    if (!data) return;
    if (Array.isArray(data)) {
      let result = [];
      for (const item of data) {
        result.push(await this.saveDo(item, writeLogs));
      }
      return result;
    } else if (typeof data === 'object' && data !== null) {
      return await this.saveDo(data, writeLogs);
    } else {
      return;
    }
  },
  saveDo: async function (data, writeLogs = null) {
    if (!data) return;
    const dbWrite = dbInterface.dbWrite();
    const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 这是你的键数组
    // 使用reduce函数对keysArray中的每个键进行处理，以构建一个新的数据对象
    const dataRow = keysArray.reduce((result, key) => {
      // 检查data对象是否具有当前键，并且该键对应的值不为空或未定义
      if (data.hasOwnProperty(key) && data[key] !== undefined) {
        // 获取当前键对应的转换类型（如果定义了的话）
        const castType = this.$casts[key];
        // 如果转换类型存在，则使用set方法对数据进行转换并赋值给结果对象
        if (castType) {
          result[key] = castType.set(data[key]);
        } else {
          // 如果没有定义转换类型，且值不为空或未定义，则将其转换为字符串后赋值给结果对象
          result[key] = data[key].toString();
        }
      }
      // 返回累积的结果对象
      return result;
    }, {});
    if (!dataRow.id) {
      return await dbWrite(this.$table).insert({ ...dataRow, created_at: dbWrite.fn.now(), updated_at: dbWrite.fn.now() })
        .then(async (affects) => {
          if (affects[0] && writeLogs) await writeLogs(affects, dataRow);
          return affects;
        })
        .catch((error) => {
          throw __filename + ':' + error.toString();
        });
    } else {
      try {
        const fields = [...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])];
        return await dbWrite(this.$table).select(fields).where(function () {
          if (Array.isArray(dataRow.id)) {
            if (dataRow.id.length > 0) this.whereIn('id', dataRow.id);
          } else {
            this.where('id', dataRow.id);
          }
        }).then(async (result) => {
          if (result.length > 0) {
            await dbWrite(this.$table).update({ ...dataRow, updated_at: dbWrite.fn.now() }).where(function () {
              if (Array.isArray(dataRow.id)) {
                if (dataRow.id.length > 0) this.whereIn('id', dataRow.id);
              } else {
                this.where('id', dataRow.id);
              }
            }).then(async () => {
              if (result && writeLogs) await writeLogs(result, dataRow);
            }).catch((error) => {
              throw __filename + ':' + error.toString();
            });
            return result.map(item => item.id);
          } else {
            return await dbWrite(this.$table).insert({ ...dataRow, created_at: dbWrite.fn.now(), updated_at: dbWrite.fn.now() })
              .then(async (affects) => {
                if (affects[0] && writeLogs) await writeLogs(affects, dataRow);
                return affects;
              })
              .catch((error) => {
                throw __filename + ':' + error.toString();
              });
          }
        });
      } catch (error) {
        logInterface.writeError(__filename + ':' + error.toString());
        return false;
      }
    }
  },
  restore: async function (where) {
    if (!where) return;
    const dbWrite = dbInterface.dbWrite();
    try {
      return await dbWrite(this.$table)
        .where(where)
        .update({
          deleted_at: null
        });
    } catch (error) {
      logInterface.writeError(__filename + ':' + error.toString());
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
    const dbWrite = dbInterface.dbWrite();
    try {
      return await dbWrite(this.$table)
        .where(where)
        .update({
          deleted_at: dbWrite.fn.now()
        });
    } catch (error) {
      logInterface.writeError(__filename + ':' + error.toString());
      return false;
    }
  },
  forceDelete: async function (where) {
    if (!where) return;
    const dbWrite = dbInterface.dbWrite();
    try {
      return await dbWrite(this.$table).delete(where);
    } catch (error) {
      logInterface.writeError(__filename + ':' + error.toString());
      return false;
    }
  }
};

module.exports = baseModel;