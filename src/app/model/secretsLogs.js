/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-11 14:12:19
 * @FilePath: /laboratory/microservice/account/src/app/model/secretsLogs.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
const databaseCast = require('@cast/database');
const utils = require('@utils/index');
const moment = require('moment-timezone');

module.exports = {
	$table: `${databaseCast.prefix}secrets_logs`,// 为模型指定表名
	$primaryKey: 'id', // 默认情况下指定'id'作为表主键，也可以指定主键名
	$fillable: [
		'secret_id',
		'source',
		'handle',
		'created_at',
		'updated_at'
	],// 定义允许添加、更新的字段白名单，不设置则无法添加数据
	$guarded: ['id'],// 定义不允许更新的字段黑名单
	$casts: {
		secret_id: 'integer',
		source: 'json',
		handle: 'json'
	},
	$hidden: [],
	filterKeys: function (obj) {
		return Object.keys(obj).filter(key => !this.$hidden.includes(key)).reduce((acc, key) => {
			acc[key] = obj[key];
			return acc;
		}, {});
	},
	getRow: async function (where) {
		const dbRead = databaseCast.dbRead();
		try {
			return await dbRead.select([...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])])
				.from(this.$table)
				.where(where)
				.first()
				.then((row) => {
					row.created_at = moment(row.created_at).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
					row.updated_at = moment(row.updated_at).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
					return row;
				})
				.catch(() => {
					return false;
				});
		} catch (err) {
			return false;
		}
	},
	save: async function (_data) {
		if (!_data) return;
		const dbWrite = databaseCast.dbWrite();
		const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 这是你的键数组
		const dataRow = keysArray.reduce((result, key) => {
			if (_data.hasOwnProperty(key)) {
				if (this.$casts[key] === 'json') {
					result[key] = JSON.stringify(_data[key]);
				} else if (this.$casts[key] === 'integer') {
					result[key] = Number(_data[key]);
				} else if (this.$casts[key] === 'datetime') {
					result[key] = _data[key] ? utils.dateFormatter(_data[key], 'Y-m-d H:i:s', 1, false) : null;
				} else {
					result[key] = _data[key];
				}
			}
			return result;
		}, {});

		if (!dataRow.id) {
			return await dbWrite(this.$table).insert({ ...dataRow, created_at: dbWrite.fn.now(), updated_at: dbWrite.fn.now() });
		} else {
			try {
				return await dbWrite(this.$table).select('id').where(function () {
					this.where('id', '>', 0)
					if (Array.isArray(dataRow.id)) {
						if (dataRow.id.length > 0) this.whereIn('id', dataRow.id);
					} else {
						this.where('id', dataRow.id);
					}
				}).then(async (result) => {
					if (result.length > 0) {
						return await dbWrite(this.$table).update({ ...dataRow, updated_at: dbWrite.fn.now() }).where(function () {
							this.where('id', '>', 0)
							if (Array.isArray(dataRow.id)) {
								if (dataRow.id.length > 0) this.whereIn('id', dataRow.id);
							} else {
								this.where('id', dataRow.id);
							}
						});
					} else {
						return await dbWrite(this.$table).insert({ ...dataRow, created_at: dbWrite.fn.now(), updated_at: dbWrite.fn.now() });
					}
				});
			} catch (err) {
				return false;
			}
		}
	}
}
