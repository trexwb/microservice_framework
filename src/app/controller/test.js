/*** 
 * @verifyor: trexwb
 * @Date: 2024-01-12 10:57:08
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-31 11:38:59
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/controller/test.js
 * @Description: 
 * @一花一世界，一叶一如来
 * Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
// const alias = require('@utils/alias');
const logCast = require('@cast/log');

function rpc_getFunctions() {
  const test = ['test'];
  const system = ['systemAnalysis'];
  const sign = ['signIn', 'signSecret', 'signInfo', 'signOut'];
  const verify = ['verifyToken'];
  const users = ['usersList', 'usersDetail', 'usersSave', 'usersEnable', 'usersDisable', 'usersRestore', 'usersDelete'];
  const roles = ['rolesList', 'rolesGet', 'rolesSave', 'rolesSort', 'rolesEnable', 'rolesDisable', 'rolesRestore', 'rolesDelete'];
  const permissions = ['permissionsList', 'permissionsGet', 'permissionsSave', 'permissionsSort', 'permissionsEnable', 'permissionsDisable', 'permissionsRestore', 'permissionsDelete'];
  return [...test, ...system, ...sign, ...verify, ...users, ...roles, ...permissions];
}

async function test(context) {
  context.eventEmitter.emit('testListener', { Success: 'Success' });
  return 'Success';
}

module.exports = {
  rpc_getFunctions,
  test
};