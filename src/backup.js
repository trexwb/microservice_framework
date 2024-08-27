/*** 
 * @Author: trexwb
 * @Date: 2024-03-11 19:59:12
 * @LastEditors: trexwb
 * @LastEditTime: 2024-04-18 09:29:15
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
  return await dbRead.select('*').from(`${process.env.DB_PREFIX}${table}`).then(async (data) => {
    if (data.length > 0) {
      const seedText = `exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    await knex(\`\${process.env.DB_PREFIX}${table}\`).del().then(async function () {
        return await knex(\`\${process.env.DB_PREFIX}${table}\`).insert(
            ${JSON.stringify(data)}
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};`
      const now = new Date();
      const saveDir = path.join(`/data/database`, process.env.DB_DATABASE, now.toISOString().slice(0, 10));
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }
      // const filePath = path.join(alias.resolve(`@resources/database`), `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}_${table}.js`);
      const filePath = path.join(saveDir, `${now.getHours()}${now.getMinutes()}_${table}.js`);
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
  await dbRead.raw('SHOW TABLES;')
    .then(async (results) => {
      if (results[0]) {
        const tableNames = results[0].map(result => result[Object.keys(result)[0]]);
        for (let i = 0; i < tableNames.length; i++) {
          await backupTable(tableNames[i].replace(process.env.DB_PREFIX, ''));
        }
      }
    })
    .catch(error => {
      console.error(error);
    });
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
//     .catch(error => console.log(error)); // 错误处理

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