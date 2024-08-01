/*** 
 * @Author: trexwb
 * @Date: 2024-03-21 11:27:59
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-08 16:32:30
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/app/model/usersSites.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const databaseCast = require('@cast/database');
const baseModel = require('./base');

const usersRolesModel = {
  $table: `${databaseCast.prefix}users_sites`,// 为模型指定表名
  $primaryKey: 'id', // 默认情况下指定'id'作为表主键，也可以指定主键名
  $fillable: [
    'user_id',
    'created_at',
    'updated_at'
  ],// 定义允许添加、更新的字段白名单，不设置则无法添加数据
  $guarded: ['id'],// 定义不允许更新的字段黑名单
  $casts: {
    site_id: 'string',
    user_id: 'integer'
  },
  $hidden: [
    'site_id',
  ],
  ...baseModel
}

module.exports = usersRolesModel;