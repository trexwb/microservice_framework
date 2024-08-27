/*** 
 * @Author: trexwb
 * @Date: 2024-01-22 16:08:36
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-23 17:38:27
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/rolesPermissions.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const dbInterface = require('@interface/database');
const baseModel = require('@model/base');
const CastBoolean = require('@cast/boolean');
const CastDatetime = require('@cast/datetime');
const CastInteger = require('@cast/integer');
const CastJson = require('@cast/json');
const CastString = require('@cast/string');

const rolesPermissionsModel = {
  $table: `${dbInterface.prefix}roles_permissions`,// 为模型指定表名
  $primaryKey: 'id', // 默认情况下指定'id'作为表主键，也可以指定主键名
  $fillable: [
    'role_id',
    'permission_id'
  ],// 定义允许添加、更新的字段白名单，不设置则无法添加数据
  $guarded: ['id'],// 定义不允许更新的字段黑名单
  $casts: {
    site_id: new CastString(),
    role_id: new CastInteger(),
    permission_id: new CastInteger()
  },
  $hidden: [
    'site_id',
  ],
  ...baseModel
}

module.exports = rolesPermissionsModel;