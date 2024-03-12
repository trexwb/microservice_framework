/*** 
 * @verifyor: trexwb
 * @Date: 2024-01-12 10:57:08
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-06 18:33:44
 * @FilePath: /laboratory/microservice/account/src/app/controller/test.js
 * @Description: 
 * @一花一世界，一叶一如来
 * Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
// const alias = require('@utils/alias');

function rpc_getFunctions() {
  const test = ['test'];
  const sign = ['signIn', 'signSecret', 'signInfo', 'signOut'];
  const verify = ['verifyToken'];
  const users = ['usersList', 'usersDetail', 'usersSave', 'usersSort', 'usersEnable', 'usersDisable', 'usersRestore', 'usersDelete'];
  const roles = ['rolesList', 'rolesGet', 'rolesSave', 'rolesSort', 'rolesEnable', 'rolesDisable', 'rolesRestore', 'rolesDelete'];
  const permissions = ['permissionsList', 'permissionsGet', 'permissionsSave', 'permissionsSort', 'permissionsEnable', 'permissionsDisable', 'permissionsRestore', 'permissionsDelete'];
  return [...test, ...sign, ...verify, ...users, ...roles, ...permissions];
}

//async function test(body, context)
// const headers = context.request.headers;
// const siteId = headers['site-id'] || 0;
// console.log('headers:', siteId);

async function test(body) {
  if (process.env.APP_DEBUG === 'true') {
    // sign
    if (body.fn === 'signIn') {
      const sign = require('@controller/sign');
      return await sign.signIn(body.account || '', body.password || '');
    }
    if (body.fn === 'signSecret') {
      const sign = require('@controller/sign');
      return await sign.signSecret(body.uuid || '', body.secret || '');
    }
    if (body.fn === 'signInfo') {
      const sign = require('@controller/sign');
      return await sign.signInfo(body.id || '');
    }
    if (body.fn === 'signOut') {
      const sign = require('@controller/sign');
      return await sign.signOut(body.token || '');
    }
    // verify
    if (body.fn === 'verifyToken') {
      const verify = require('@controller/verify');
      return await verify.verifyToken(body.token || '');
    }
    // users
    if (body.fn === 'usersList') {
      const users = require('@controller/users');
      return await users.usersList(body.filter || '', body.sort || null, body.page || 1, body.pageSize || 10);
    }
    if (body.fn === 'usersDetail') {
      const users = require('@controller/users');
      return await users.usersDetail(body.id || body.filter || '');
    }
    if (body.fn === 'usersSave') {
      const users = require('@controller/users');
      return await users.usersSave(body);
    }
    if (body.fn === 'usersSort') {
      const users = require('@controller/users');
      return await users.usersSort(body);
    }
    if (body.fn === 'usersEnable') {
      const users = require('@controller/users');
      return await users.usersEnable(body);
    }
    if (body.fn === 'usersDisable') {
      const users = require('@controller/users');
      return await users.usersDisable(body);
    }
    if (body.fn === 'usersRestore') {
      const users = require('@controller/users');
      return await users.usersRestore(body);
    }
    if (body.fn === 'usersDelete') {
      const users = require('@controller/users');
      return await users.usersDelete(body);
    }
    // roles
    if (body.fn === 'rolesList') {
      const roles = require('@controller/roles');
      return await roles.rolesList(body.filter || '', body.sort || null, body.page || 1, body.pageSize || 10);
    }
    if (body.fn === 'rolesGet') {
      const roles = require('@controller/roles');
      return await roles.rolesGet(body.id || body.filter || '');
    }
    if (body.fn === 'rolesSave') {
      const roles = require('@controller/roles');
      return await roles.rolesSave(body);
    }
    if (body.fn === 'rolesSort') {
      const roles = require('@controller/roles');
      return await roles.rolesSort(body);
    }
    if (body.fn === 'rolesEnable') {
      const roles = require('@controller/roles');
      return await roles.rolesEnable(body);
    }
    if (body.fn === 'rolesDisable') {
      const roles = require('@controller/roles');
      return await roles.rolesDisable(body);
    }
    if (body.fn === 'rolesRestore') {
      const roles = require('@controller/roles');
      return await roles.rolesRestore(body);
    }
    if (body.fn === 'rolesDelete') {
      const roles = require('@controller/roles');
      return await roles.rolesDelete(body);
    }
    // permissions
    if (body.fn === 'permissionsList') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsList(body.filter || '', body.sort || null, body.page || 1, body.pageSize || 10);
    }
    if (body.fn === 'permissionsGet') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsGet(body.id || body.filter || '');
    }
    if (body.fn === 'permissionsSave') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsSave(body);
    }
    if (body.fn === 'permissionsSort') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsSort(body);
    }
    if (body.fn === 'permissionsEnable') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsEnable(body);
    }
    if (body.fn === 'permissionsDisable') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsDisable(body);
    }
    if (body.fn === 'permissionsRestore') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsRestore(body);
    }
    if (body.fn === 'permissionsDelete') {
      const permissions = require('@controller/permissions');
      return await permissions.permissionsDelete(body);
    }
  }
  return 'Success';
}

module.exports = {
  rpc_getFunctions,
  test
};