/*** 
 * @Author: trexwb
 * @Date: 2024-01-15 19:58:20
 * @LastEditors: trexwb
 * @LastEditTime: 2024-02-21 15:02:42
 * @FilePath: /laboratory/microservice/account/src/app/cast/database.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
// require('dotenv').config();
// console.log(process.env);
const knex = require('knex');
const knexConfig = require('@config/knex');

// const dbRead = knex(knexConfig.read);
// const dbWrite = knex(knexConfig.write);

module.exports = {
	clientWrite: null,
	clientRead: null,
	prefix: process.env.DB_PREFIX || '',
	dbWrite: function() {
		if (this.clientWrite) {
			if (!this.clientWrite.context || !this.clientWrite.context?.client || !this.clientWrite.context?.client?.pool || this.clientWrite.context?.client?.pool === undefined) {
				this.destroy(); // 链接池不存在就销毁
			}else{
				return this.clientWrite;
			}
		}
		this.clientWrite = knex(knexConfig.write);
		return this.clientWrite;
	},
	dbRead: function() {
		if (this.clientRead) {
			if (!this.clientRead.context || !this.clientRead.context?.client || !this.clientRead.context?.client?.pool || this.clientRead.context?.client?.pool === undefined) {
				this.destroy(); // 链接池不存在就销毁
			}else{
				return this.clientRead;
			}
		}
		this.clientRead = knex(knexConfig.read);
		return this.clientRead;
	},
	destroy: function() {
		try {
			this.clientWrite && this.clientWrite.destroy();
			this.clientRead && this.clientRead.destroy();
			this.clientWrite = null;
			this.clientRead = null;
		} catch (err) { }
	}
}
