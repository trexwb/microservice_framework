/*** 
 * @Author: trexwb
 * @Date: 2024-01-22 16:04:25
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-23 17:38:22
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/roles.js
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

const rolesModel = {
  $table: `${dbInterface.prefix}roles`,// 为模型指定表名
  $primaryKey: 'id', // 默认情况下指定'id'作为表主键，也可以指定主键名
  $fillable: [
    'name',
    'permissions',
    'status',
    'created_at',
    'updated_at'
  ],// 定义允许添加、更新的字段白名单，不设置则无法添加数据
  $guarded: ['id'],// 定义不允许更新的字段黑名单
  $casts: {
    site_id: new CastString(),
    name: new CastString(),
    permissions: new CastJson(),
    status: new CastInteger()
  },
  $hidden: [
    'site_id',
    'deleted_at'
  ],
  ...baseModel
}

module.exports = rolesModel;