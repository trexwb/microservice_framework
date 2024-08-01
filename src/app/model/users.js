/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-08 16:28:04
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/users.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const databaseCast = require('@cast/database');
const baseModel = require('./base');

const usersModel = {
  $table: `${databaseCast.prefix}users`,// 为模型指定表名
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
    nickname: 'string',
    email: 'string',
    mobile: 'string',
    avatar: 'string',
    password: 'string',
    salt: 'string',
    remember_token: 'string',
    uuid: 'string',
    secret: 'string',
    extension: 'json',
    status: 'integer'
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