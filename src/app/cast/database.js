/*** 
 * @Author: trexwb
 * @Date: 2024-01-15 19:58:20
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-16 10:53:47
 * @FilePath: /laboratory/application/drive/src/app/cast/database.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
// require('dotenv').config();
// console.log(process.env.NODE_ENV, process.env);
const knex = require('knex');
const knexConfig = require('@config/knex');
// const logCast = require('@cast/log');

// const dbRead = knex(knexConfig.read);
// const dbWrite = knex(knexConfig.write);

module.exports = {
	clientWrite: null,
	clientRead: null,
	prefix: process.env.DB_PREFIX || '',
	// 检查并销毁无效的连接池
	destroyIfInvalid: function (client) {
		if (client?.context?.client?.pool) {
			return client;
		} else {
			this.destroy();
			return false;
		}
	},
	dbWrite: function () {
		this.clientWrite = this.destroyIfInvalid(this.clientWrite) || knex(knexConfig.write);
		if(!this.clientWrite){
			this.clientWrite = knex(knexConfig.write);
		}
		return this.clientWrite;
	},
	dbRead: function () {
		this.clientRead = this.destroyIfInvalid(this.clientRead) || knex(knexConfig.read);
		if(!this.clientRead){
			this.clientRead = knex(knexConfig.read);
		}
		return this.clientRead;
	},
	destroy: function () {
		// try {
		// 	if (this.clientWrite) this.clientWrite.destroy();
		// 	if (this.clientRead) this.clientRead.destroy();
		// } catch (error) {
		// 	logCast.writeError(`Error destroying Mysql connections: ${error}`);
		// }
		this.clientWrite = null;
		this.clientRead = null;
	}
}
