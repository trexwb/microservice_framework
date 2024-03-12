/*** 
 * @Author: trexwb
 * @Date: 2024-01-04 14:29:21
 * @LastEditors: trexwb
 * @LastEditTime: 2024-02-21 15:01:24
 * @FilePath: /laboratory/microservice/account/migrations/20231215144626_secrets.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
// require('dotenv').config();
// console.log(process.env);
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}secrets`, (table) => {
        table.increments('id');
        table.string('channel').notNullable().comment('渠道名称');
        table.string('app_id', 40).notNullable().comment('公钥ID');
        table.string('app_secret', 40).notNullable().comment('私钥');
        table.json('permissions').nullable().comment('权限说明');
        table.json('extension').nullable().comment('扩展');
        table.specificType('status', 'TINYINT UNSIGNED').defaultTo(0).comment('状态');
        table.timestamps();
        table.timestamp('deleted_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}secrets`);
};
