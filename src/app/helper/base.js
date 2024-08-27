/*** 
 * @Author: trexwb
 * @Date: 2024-08-27 12:06:12
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-27 12:06:13
 * @FilePath: //microservice_framework/src/app/helper/base.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
/*** 
 * @Author: trexwb
 * @Date: 2024-08-22 15:11:15
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-23 18:00:11
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/helper/base.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */

'use strict';
const utils = require('@utils/index');
const cacheInterface = require('@interface/cache');

// const Mutex = require('async-mutex').Mutex;
// const mutex = new Mutex();

const baseHelper = {
  buildWhere: function (that, where) {
    function applyWhereCondition(field, value) {
      if (Array.isArray(value)) {
        if (value.length > 0) that.whereIn(field, value);
      } else {
        that.where(field, value);
      }
    }
    that.where('id', '>', 0);
    if (where.id) {
      applyWhereCondition('id', where.id);
    }
  },
  getAll: async function (where) { // await categoriesHelper.getList({keywords: '1',status: '0'});
    let rows = [];
    try {
      const sortWhere = utils.sortMultiDimensionalObject(where);
      const cacheKey = `${this.$cacheKey}[all:${JSON.stringify([sortWhere])}]`;
      rows = await cacheInterface.get(cacheKey);
      if (!rows) {
        const that = this;
        rows = await this.$model.getAll(function () {
          that.buildWhere(this, where);
        });
        if (rows) {
          cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, rows);
        }
      }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return rows;
  },
  getList: async function (where, order, _page, _pageSize) { // await secretsHelper.getList({keywords: '1',status: '0'});
    if (!this.$model) return null;
    let rows = {};
    try {
      const sortWhere = utils.sortMultiDimensionalObject(where);
      const sortOrder = utils.sortMultiDimensionalObject(order);
      const page = utils.safeCastToInteger(_page ?? 1);
      const pageSize = utils.safeCastToInteger(_pageSize ?? 10);
      const offset = utils.safeCastToInteger(!page ? 0 : pageSize * (page - 1));
      const cacheKey = `${this.$cacheKey}[list:${JSON.stringify([sortWhere, sortOrder, page, pageSize])}]`;
      // const release = await mutex.acquire(cacheKey);
      // try {
      rows = await cacheInterface.get(cacheKey);
      if (!rows?.total) {
        const that = this;
        rows = await this.$model.getList(function () {
          that.buildWhere(this, where)
        }, order, pageSize, offset);
        if (rows?.total) {
          cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, rows);
        }
      }
      // } finally {
      //   release();
      // }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return rows;
  },
  getRow: async function (where) {
    if (!this.$model) return null;
    if (!where) return null;
    let row = null;
    try {
      const sortWhere = utils.sortMultiDimensionalObject(where);
      const cacheKey = `${this.$cacheKey}[row:${JSON.stringify([sortWhere])}]`;
      // const release = await mutex.acquire(cacheKey);
      // try {
      row = await cacheInterface.get(cacheKey);
      if (!row?.id) {
        const that = this;
        row = await this.$model.getRow(function () {
          that.buildWhere(this, where);
        });
        if (row?.id) {
          cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, row);
        }
      }
      // } finally {
      //   release();
      // }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return row;
  },
  getId: async function (id) {
    if (!this.$model) return null;
    if (!id) return null;
    let row = null;
    try {
      const cacheKey = `${this.$cacheKey}[id:${id}]`;
      // const release = await mutex.acquire(cacheKey);
      // try {
      row = await cacheInterface.get(cacheKey);
      if (!row?.id) {
        const that = this;
        row = await this.$model.getRow(function () {
          that.buildWhere(this, { "id": id });
        });
        if (row?.id) {
          cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, row);
        }
      }
      // } finally {
      //   release();
      // }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return row;
  },
  getTotal: async (where) => {
    if (!this.$model) return null;
    let rows = false;
    try {
      const sortWhere = utils.sortMultiDimensionalObject(where);
      const cacheKey = `${this.$cacheKey}[total:${JSON.stringify([sortWhere])}]`;
      rows = await cacheInterface.get(cacheKey);
      if (!rows) {
        const that = this;
        rows = await this.$model.getTotal(function () {
          that.buildWhere(this, where)
        });
        if (rows) {
          cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, rows);
        }
      }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return rows;
  },
  getSum: async (field, where) => {
    if (!this.$model) return null;
    let rows = false;
    try {
      const sortWhere = utils.sortMultiDimensionalObject(where);
      const cacheKey = `${this.$cacheKey}[sum:${JSON.stringify([field, sortWhere])}]`;
      // const release = await mutex.acquire(cacheKey);
      // try {
      rows = await cacheInterface.get(cacheKey);
      if (!rows) {
        const that = this;
        rows = await this.$model.getSum(field, function () {
          that.buildWhere(this, where)
        });
        if (rows) {
          cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, rows);
        }
      }
      // } finally {
      //   release();
      // }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return rows;
  },
  update: async function (where, data) {
    if (!this.$model) return null;
    if (!where || !data) return null;
    let affects = {};
    try {
      const that = this;
      affects = await this.$model.update(function () {
        that.buildWhere(this, where)
      }, data);
      await cacheInterface.clearCacheByTag(this.$cacheKey);
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return affects;
  },
  save: async function (data) {
    if (!this.$model) return null;
    if (!data) return null;
    let affects = {};
    try {
      affects = await this.$model.save(data);
      await cacheInterface.clearCacheByTag(this.$cacheKey);
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return affects;
  },
  restore: async function (where) {
    if (!this.$model) return null;
    if (!where) return null;
    let affects = {};
    try {
      const that = this;
      affects = await this.$model.restore(function () {
        that.buildWhere(this, where);
      });
      await cacheInterface.clearCacheByTag(this.$cacheKey);
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return affects;
  },
  delete: async function (where) {
    if (!this.$model) return null;
    if (!where) return null;
    let affects = {};
    try {
      const that = this;
      affects = await this.$model.delete(function () {
        that.buildWhere(this, where);
      });
      await cacheInterface.clearCacheByTag(this.$cacheKey);
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return affects;
  },
}
module.exports = baseHelper;