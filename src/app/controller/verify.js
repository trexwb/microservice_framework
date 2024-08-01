/*** 
 * @Author: trexwb
 * @Date: 2024-01-18 17:18:38
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-31 10:37:16
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/controller/verify.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
const status = require('@utils/status');
const logCast = require('@cast/log');

async function verifyToken(...args) {
  // 获取上下文
  const statusSrgs = status.getContext(args);
  const context = statusSrgs.context;
  const [token = null] = statusSrgs.params;
  if (!token) {
    return status.error('token Not Empty');
  }
  try {
    const usersHelper = require('@helper/users');
    const userRow = await usersHelper.getRow({
      remember_token: token
    });
    if (!userRow?.id) {
      return status.error('Token Not User');
    }
    if (!userRow.status) {
      return status.error('Token User Status Error');
    }
    // 拥有的所有角色
    const rolesRows = await usersHelper.getUserRoles(context.secretRow?.siteId || 0, userRow.id);
    if (rolesRows) {
      userRow.roles = rolesRows.roles || [];
      userRow.permissions = rolesRows.permissions || [];
    }
    return userRow;
  } catch (error) {
    logCast.writeError(__filename + ':' + error.toString());
    return false;
  }
}

async function hasPermission(...args) {
  // 获取上下文
  const statusSrgs = status.getContext(args);
  const context = statusSrgs.context;
  const [token = null, role = null, permission = null] = statusSrgs.params;
  if (!token) {
    return status.error('token Not Empty');
  }
  if (!role) {
    return status.error('role Not Empty');
  }
  if (!permission) {
    return status.error('permission Not Empty');
  }
  try {
    const usersHelper = require('@helper/users');
    const userRow = await usersHelper.getRow({
      remember_token: token
    });
    if (!userRow?.id) {
      return status.error('Token Not User');
    }
    if (!userRow.status) {
      return status.error('Token User Status Error');
    }
    const rolesRows = await usersHelper.getUserRoles(context.secretRow?.siteId || 0, userRow.id);
    if (rolesRows) {
      if (!(rolesRows.roles || []).includes(role)) {
        return status.error('Role Not User');
      }
      if (!(rolesRows.permissions || []).includes(permission)) {
        return status.error('Permission Not User');
      }
      return true;
    } else {
      return status.error('Roles Error');
    }
  } catch (error) {
    logCast.writeError(__filename + ':' + error.toString());
    return false;
  }


}

module.exports = {
  verifyToken,
  hasPermission
};