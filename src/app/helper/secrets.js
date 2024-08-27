/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-23 17:32:34
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/helper/secrets.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const cacheInterface = require('@interface/cache');
const secretsModel = require('@model/secrets');
const baseHelper = require('@helper/base');

const secretsHelper = {
  $cacheKey: 'secrets',
  $model: secretsModel,
  ...baseHelper,
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
  },
  getAppId: async function (appId) {
    if (!appId) return;
    let row = {};
    try {
      const that = this;
      const cacheKey = `${this.$cacheKey}[appid:${appId}]`;
      row = await cacheInterface.get(cacheKey);
      if (!row?.id) {
        row = await secretsModel.getRow(function () {
          that.buildWhere(this, { "app_id": appId })
        });
        if (row?.id) {
          await cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, row)
        }
      }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return row;
  },
}

module.exports = secretsHelper;