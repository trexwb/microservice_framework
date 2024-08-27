/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-08-23 17:41:45
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/users.js
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

const usersModel = {
  $table: `${dbInterface.prefix}users`,// 为模型指定表名
  $primaryKey: 'id', // 默认情况下指定'id'作为表主键，也可以指定主键名
  $fillable: [
    'nickname',
    'email',
    'mobile',
    'avatar',
    'uuid',
    'extension',
    'status',
    'created_at',
    'updated_at'
  ],// 定义允许添加、更新的字段白名单，不设置则无法添加数据
  $guarded: ['id'],// 定义不允许更新的字段黑名单
  $casts: {
    nickname: new CastString(),
    email: new CastString(),
    mobile: new CastString(),
    avatar: new CastString(),
    password: new CastString(),
    salt: new CastString(),
    remember_token: new CastString(),
    uuid: new CastString(),
    secret: new CastString(),
    extension: new CastJson(),
    status: new CastInteger()
  },
  $hidden: [
    'password',
    'salt',
    'remember_token',
    'secret',
    'deleted_at'
  ],
  ...baseModel
}

module.exports = usersModel;