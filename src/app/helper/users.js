/*** 
 * @Author: trexwb
 * @Date: 2024-08-27 12:06:27
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-27 12:06:29
 * @FilePath: //microservice_framework/src/app/helper/users.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
/*** 
 * @Author: trexwb
 * @Date: 2024-01-12 14:48:44
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-23 17:32:43
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/helper/users.js
 * @Description: 
 * @一花一世界，一叶一如来
 * Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const utils = require('@utils/index');
const cacheInterface = require('@interface/cache');
const usersModel = require('@model/users');
const rolesModel = require('@model/roles');
const usersRolesModel = require('@model/usersRoles');
const usersSitesModel = require('@model/usersSites');
const permissionsModel = require('@model/permissions');
const rolesPermissionsModel = require('@model/rolesPermissions');
const baseHelper = require('@helper/base');

const usersHelper = {
  $cacheKey: 'users',
  $model: usersModel,
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
    if (where.uuid) {
      applyWhereCondition('uuid', where.uuid);
    }
    if (where.keywords) {
      that.where(function () {
        //whereJsonPath
        this.orWhere('nickname', 'like', `%${where.keywords}%`);
        this.orWhere('email', 'like', `%${where.keywords}%`);
        this.orWhere('mobile', 'like', `%${where.keywords}%`);
        this.orWhere('uuid', 'like', `%${where.keywords}%`);
        this.orWhere('extension', 'like', `%${where.keywords}%`);
      });
    }
    if (where.account) {
      that.where(function () {
        this.orWhere('email', where.account);
        this.orWhere('mobile', where.account);
      });
    } else {
      if (where.email) {
        that.where('email', where.email);
      }
      if (where.mobile) {
        that.where('mobile', where.mobile);
      }
    }
    if (where.nickname) {
      that.where('nickname', where.nickname);
    }
    if (where.remember_token) {
      that.where('remember_token', where.remember_token);
    }
    // 按角色搜索用户
    if (where.role_id) {
      that.whereIn('id', function () {
        if (Array.isArray(where.role_id)) {
          if (where.role_id.length > 0) this.select('user_id').from(usersRolesModel.$table).whereIn('role_id', where.role_id);
        } else {
          this.select('user_id').from(usersRolesModel.$table).where('role_id', where.role_id);
        }
      });
      // 效率低下时请更换成whereExists
      // that.whereExists(function () {
      //   if (Array.isArray(where.role_id)) {
      //     if (where.role_id.length > 0) {
      //       this.select('user_id')
      //         .from(usersRolesModel.$table)
      //         .whereRaw(`${usersRolesModel.$table}.user_id = ${that.$table}.id`)
      //         .where('site_id', siteId)
      //         .whereIn('role_id', where.role_id);
      //     }
      //   } else {
      //     this.select('user_id')
      //       .from(usersRolesModel.$table)
      //       .whereRaw(`${usersRolesModel.$table}.user_id = ${that.$table}.id`)
      //       .where('site_id', siteId)
      //       .where('role_id', where.role_id);
      //   }
      // })
    }
    if (where.site_id) {
      that.whereIn('id', function () {
        this.select('user_id').from(usersSitesModel.$table).where('site_id', where.site_id);
      });
    }
  },
  getUuid: async function (uuid) {
    if (!uuid) return {};
    let row = {};
    try {
      const that = this;
      const cacheKey = `${this.$cacheKey}[uuid:${uuid}]`;
      row = await cacheInterface.get(cacheKey);
      if (!row?.id) {
        row = await usersModel.getRow(function () {
          that.buildWhere(this, {
            "uuid": uuid
          })
        });
        if (row?.id) {
          await cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, row);
        }
      }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return row;
  },
  getUserRoles: async function (siteId, id) {
    if (!siteId) return {};
    if (!id) return {};
    let row = {};
    try {
      const cacheKey = `${this.$cacheKey}[roles:${siteId},${id}]`;
      row = await cacheInterface.get(cacheKey);
      if (!row?.id) {
        // 拥有的所有角色
        const rolesRows = await rolesModel.getAll(function () {
          this.where('site_id', siteId);
          this.where('status', 1);
          this.whereIn('id', function () {
            this.select('role_id').from(usersRolesModel.$table)
              .where('site_id', siteId)
              .where('status', 1)
              .where('user_id', id);
          });
          // 效率低下时请更换成whereExists
          // this.whereExists(function () {
          //   this.select('role_id')
          //     .from(usersRolesModel.$table)
          //     .whereRaw(`${usersRolesModel.$table}.role_id = ${that.$table}.id`)
          //     .where('site_id', siteId)
          //     .where('status', 1)
          //     .where('user_id', id);
          // })
        });
        let rolesIds = [];
        row = {
          id: id,
          roles: [],
          permissions: []
        }
        rolesRows.forEach((item, index) => {
          rolesIds.push(item.id);
          row.roles = [...item.permissions];
          // row.roles = [...new Set([...row.roles, ...item.permissions])];
        });
        // 用户的所有权限
        if (rolesIds.length > 0) {
          const permissionsRows = await permissionsModel.getAll(function () {
            this.where('status', 1);
            this.whereIn('id', function () {
              this.select('permission_id').from(rolesPermissionsModel.$table)
                .where('site_id', siteId)
                .whereIn('role_id', rolesIds);
            });
            // 效率低下时请更换成whereExists
            // this.whereExists(function () {
            //   this.select('permission_id')
            //     .from(rolesPermissionsModel.$table)
            //     .whereRaw(`${rolesPermissionsModel.$table}.permission_id = ${that.$table}.id`)
            //     .where('site_id', siteId)
            //     .whereIn('role_id', rolesIds);
            // })
          });
          permissionsRows.forEach((item, index) => {
            row.permissions.push(item.value);
            // row.permissions = [...new Set([...row.permissions, ...item.extension])];
          });
        }
        await cacheInterface.setCacheWithTags(this.$cacheKey, cacheKey, row);
      }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return row;
  },
  setToken: async function (data) {
    if (!data) return {};
    try {
      const remember_token = utils.generateRandomString(64);
      if (await usersModel.save({
        id: data.id || 0,
        remember_token: remember_token
      })) {
        await cacheInterface.clearCacheByTag(this.$cacheKey);
        return remember_token;
      }
    } catch (error) {
      throw __filename + ':' + error.toString();
    }
    return;
  },
}

module.exports = usersHelper;