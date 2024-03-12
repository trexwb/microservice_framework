/*** 
 * @Author: trexwb
 * @Date: 2024-03-12 09:12:06
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-12 10:48:00
 * @FilePath: /laboratory/microservice/account/backup.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
require('dotenv').config();
// Update with your config settings.
require('module-alias/register');

const path = require('path');
const fs = require('fs');
const alias = require('@utils/alias');

const databaseCast = require('@cast/database');
const dbRead = databaseCast.dbRead();

async function backupTable(table) {
    await dbRead.select('*').from(`${process.env.DB_PREFIX}${table}`).then(async (data) => {
        if (data.length > 0) {
            const seedText = `exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    knex(\`\${process.env.DB_PREFIX}${table}\`).del().then(function () {
        return knex(\`\${process.env.DB_PREFIX}${table}\`).insert(
            ${JSON.stringify(data)}
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};`
            const now = new Date();
            const filePath = path.join(alias.resolve(`@resources/database`), `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}_${table}.js`);
            try {
                fs.writeFileSync(filePath, seedText);
                console.log(filePath, 'successfully.');
            } catch (error) {
                console.error(filePath, error);
            }
        }

        return data;
    })
}

async function run() {
    await backupTable('secrets');
    await backupTable('secrets_logs');
    await backupTable('users');
    await backupTable('users_logs');
    await backupTable('roles');
    await backupTable('permissions');
    await backupTable('users_roles');
    await backupTable('roles_permissions');
    await backupTable('users_alipay');
    await backupTable('users_ding');
    await backupTable('users_wechat');
    await backupTable('codes');
    await dbRead.destroy();
    process.exit(0);
}
run();

// console.log(process.env.NODE_ENV)
// const knex = require('knex')(require('./knexfile').development); // 获取数据库链接

// knex.select('*').from('users') // 查询users表中所有数据
//     .then(data => {
//         console.log(JSON.stringify(data)); // 打印或者以其他方式将数据保存
//     })
//     .catch(err => console.log(err)); // 错误处理

// exports.seed = async function (knex) {
//     // Deletes ALL existing entries
//     return knex('users').del()
//         .then(function () {
//             // Inserts seed entries  （将上一步获取的数据复制到这里）
//             return knex('users').insert([
//                 { id: 1, name: 'User1', email: 'user1@test.com' },
//             ]);
//         });
// };