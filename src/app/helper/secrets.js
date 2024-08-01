/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-09 16:16:24
 * @FilePath: /drive/secrets/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/helper/secrets.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const cacheCast = require('@cast/cache');
const secretsModel = require('@model/secrets');

function buildWhere(that, where) {
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
  if (where.app_id) {
    applyWhereCondition('app_id', where.app_id);
  }
  if (where.status || where.status === 0) {
    applyWhereCondition('status', where.status);
  }
  if (where.keywords) {
    that.where(function () {
      this.orWhere('channel', 'like', `%${where.keywords}%`);
      this.orWhere('app_id', 'like', `%${where.keywords}%`);
      this.orWhere('extension', 'like', `%${where.keywords}%`);
    });
  }
}

const secretsHelper = {
  getAppId: async (appId) => {
    if (!appId) return;
    let secretRow = {};
    try {
      const cacheKey = `secrets[appid:${appId}]`;
      secretRow = await cacheCast.get(cacheKey);
      if (!secretRow?.id) {
        secretRow = await secretsModel.getRow(function () {
          buildWhere(this, {
            "app_id": appId
          })
        });
        if (secretRow?.id) {
          await cacheCast.setCacheWithTags('secrets', cacheKey, secretRow)
        }
      }
    } catch (error) {
      throw error;
    }
    return secretRow;
  },
  getList: async (where, order, _page, _pageSize) => { // await secretsHelper.getList({keywords: '1',status: '0'});
    let rows = false;
    try {
      const sortWhere = utils.sortMultiDimensionalObject(where);
      const sortOrder = utils.sortMultiDimensionalObject(order);
      const page = Number(_page ?? 1);
      const pageSize = Number(_pageSize ?? 10);
      const offset = Number(!page ? 0 : pageSize * (page - 1));
      const cacheKey = `secrets[list:${JSON.stringify([sortWhere, sortOrder, page, pageSize])}]`;
      rows = await cacheCast.get(cacheKey);
      if (!rows?.total) {
        rows = await secretsModel.getList(function () {
          buildWhere(this, where)
        }, null, pageSize, offset);
        if (rows?.total) {
          await cacheCast.setCacheWithTags('secrets', cacheKey, rows);
        }
      }
    } catch (error) {
      throw error;
    }
    return rows;
  },
  getId: async (id) => {
    if (!id) return {};
    let row = {};
    try {
      const cacheKey = `secrets[id:${id}]`;
      row = await cacheCast.get(cacheKey);
      if (!row?.id) {
        row = await secretsModel.getRow(function () {
          buildWhere(this, {
            "id": id
          })
        });
        if (row?.id) {
          await cacheCast.setCacheWithTags('secrets', cacheKey, row);
        }
      }
    } catch (error) {
      throw error;
    }
    return row;
  },
  update: async (where, data) => {
    if (!where || !data) return;
    let affects = {};
    try {
      affects = await secretsModel.update(function () {
        buildWhere(this, where)
      }, data);
      await cacheCast.clearCacheByTag('secrets');
    } catch (error) {
      throw error;
    }
    return affects;
  },
  save: async (data) => {
    if (!data) return;
    let affects = {};
    try {
      affects = await secretsModel.save(data);
      await cacheCast.clearCacheByTag('secrets');
    } catch (error) {
      throw error;
    }
    return affects;
  },
  restore: async (where) => {
    if (!where) return;
    let affects = {};
    try {
      affects = await secretsModel.restore(function () {
        buildWhere(this, where)
      });
      await cacheCast.clearCacheByTag('secrets');
    } catch (error) {
      throw error;
    }
    return affects;
  },
  delete: async (where) => {
    if (!where) return;
    let affects = {};
    try {
      affects = await secretsModel.delete(function () {
        buildWhere(this, where)
      });
      await cacheCast.clearCacheByTag('secrets');
    } catch (error) {
      throw error;
    }
    return affects;
  },
}

module.exports = secretsHelper;