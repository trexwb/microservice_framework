/*** 
 * @Author: trexwb
 * @Date: 2024-01-18 11:37:21
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-31 10:36:15
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/controller/sign.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
const status = require('@utils/status');
const logCast = require('@cast/log');

const ERROR_MESSAGES = {
  ACCOUNT_NOT_EMPTY: 'Account NOT Empty',
  ACCOUNT_ERROR: 'Account Error',
  ACCOUNT_PASSWORD_ERROR: 'Account Password Error',
  ACCOUNT_STATUS_ERROR: 'Account Status Error',
  ID_NOT_EMPTY: 'Id NOT Empty',
};

async function signIn(...args) {
  // 获取上下文
  const statusSrgs = status.getContext(args);
  const context = statusSrgs.context;
  const [account = null, password = null] = statusSrgs.params;
  const cryptTool = require('@utils/cryptTool');
  const usersHelper = require('@helper/users');
  try {
    function isValidEmail(email) {
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(String(email).toLowerCase());
    }
    function isValidPhoneNumber(phoneNumber) {
      const pattern = /^1[3456789]\d{9}$/;
      return pattern.test(phoneNumber);
    }
    let where = {};
    if (account) {
      if (isValidEmail(account)) {
        where.email = account;
      } else if (isValidPhoneNumber(account)) {
        where.mobile = account;
      } else {
        where.account = account;
      }
    } else {
      return status.error(ERROR_MESSAGES.ACCOUNT_NOT_EMPTY);
    }
    const userRow = await usersHelper.getRow(where);
    if (!userRow?.id) {
      return status.error(ERROR_MESSAGES.ACCOUNT_ERROR);
    }
    if (userRow.password != cryptTool.md5(password.toString() + userRow.salt)) {
      return status.error(ERROR_MESSAGES.ACCOUNT_PASSWORD_ERROR);
    }
    if (!userRow.status) {
      return status.error(ERROR_MESSAGES.ACCOUNT_STATUS_ERROR);
    }
    return {
      uuid: userRow.uuid,
      remember_token: userRow.remember_token,
    };
  } catch (error) {
    logCast.writeError(__filename + ':' + error.toString());
    return false;
  }
}

async function signSecret(...args) {
  // 获取上下文
  const statusSrgs = status.getContext(args);
  const context = statusSrgs.context;
  const [uuid = null, secret = null] = statusSrgs.params;
  try {
    const cryptTool = require('@utils/cryptTool');
    const usersHelper = require('@helper/users');
    const userRow = await usersHelper.getUuid(uuid);
    if (!userRow?.id) {
      return status.error(ERROR_MESSAGES.ACCOUNT_ERROR);
    }
    const userSecret = cryptTool.md5(userRow.uuid.toString() + userRow.secret.toString());
    if (secret != userSecret) {
      return status.error(ERROR_MESSAGES.ACCOUNT_PASSWORD_ERROR);
    }
    if (!userRow.status) {
      return status.error(ERROR_MESSAGES.ACCOUNT_STATUS_ERROR);
    }
    userRow.remember_token = await usersHelper.setToken(userRow.id);
    return {
      uuid: userRow.uuid,
      remember_token: userRow.remember_token,
    };
  } catch (error) {
    logCast.writeError(__filename + ':' + error.toString());
    return false;
  }
}

async function signInfo(...args) {
  // 获取上下文
  const statusSrgs = status.getContext(args);
  const context = statusSrgs.context;
  const [id = null] = statusSrgs.params;
  try {
    if (!id) {
      return status.error(ERROR_MESSAGES.ID_NOT_EMPTY);
    }
    const usersHelper = require('@helper/users');
    const userRow = await usersHelper.getId(id);

    // 拥有的所有角色
    if (userRow?.id) {
      const rolesRows = await usersHelper.getUserRoles(context.secretRow?.siteId || 0, userRow.id);
      if (rolesRows) {
        userRow.roles = rolesRows.roles || [];
        userRow.permissions = rolesRows.permissions || [];
      }
    }
    return {
      uuid: userRow.uuid,
      nickname: userRow.nickname,
      avatar: userRow.avatar,
      roles: userRow.roles || [],
      permissions: userRow.permissions || [],
    };
  } catch (error) {
    logCast.writeError(__filename + ':' + error.toString());
    return false;
  }
}

async function signOut(...args) {
  // 获取上下文
  const statusSrgs = status.getContext(args);
  const context = statusSrgs.context;
  const [currentAccount = null] = statusSrgs.params;
  try {
    const usersHelper = require('@helper/users');
    return await usersHelper.setToken(currentAccount);
  } catch (error) {
    logCast.writeError(__filename + ':' + error.toString());
    return false;
  }
}

module.exports = {
  signIn,
  signSecret,
  signInfo,
  signOut
};