/*** 
 * @Author: trexwb
 * @Date: 2024-01-29 08:30:55
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-11 14:12:04
 * @FilePath: /laboratory/microservice/account/src/app/model/secrets.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
const databaseCast = require('@cast/database');
const utils = require('@utils/index');
const moment = require('moment-timezone');

module.exports = {
	$table: `${databaseCast.prefix}secrets`,// 为模型指定表名
	$primaryKey: 'id', // 默认情况下指定'id'作为表主键，也可以指定主键名
	$fillable: [
		'channel',
		'app_id',
		'permissions',
		'extension',
		'status',
		'created_at',
		'updated_at'
	],// 定义允许添加、更新的字段白名单，不设置则无法添加数据
	$guarded: ['id'],// 定义不允许更新的字段黑名单
	$casts: {
		channel: 'string',
		app_id: 'string',
		app_secret: 'string',
		status: 'integer',
		extension: 'json'
	},
	$hidden: [
		'app_secret',
		'deleted_at'
	],
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
				.whereNull('deleted_at')
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
	getTrashRow: async function (where) {
		const dbRead = databaseCast.dbRead();
		try {
			return await dbRead.select([...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])])
				.from(this.$table)
				.where(where)
				.whereNotNull('deleted_at')
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
	getList: async function (where, order, limit, offset) {
		const dbRead = databaseCast.dbRead();
		limit = limit > 1000 ? 1000 : limit;
		order = !order ? [{ column: 'id', order: 'ASC' }] : order;
		try {
			const total = (await dbRead.from(this.$table)
				.where(where)
				.whereNull('deleted_at')
				.count('id', { as: 'total' }).first())?.total || 0;
			if (total > 0) {
				const rows = await dbRead.select([...new Set([...this.$guarded, ...this.$fillable])])
					.from(this.$table)
					.where(where)
					.whereNull('deleted_at')
					// .orderByRaw('if(`sort`>0,1,0) DESC,sort ASC').orderBy([{ column: 'sort', order: 'ASC' }]) // 有排序sort字段时使用
					.orderBy(order)
					.limit(limit || 10)
					.offset(offset || 0)
					.then((rows) => {
						return rows.map(row => ({
							...row,
							created_at: moment(row.created_at).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
							updated_at: moment(row.updated_at).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
						}))
					})
					.catch(() => {
						return false;
					});
				return { total: total, list: rows };
			} else {
				return { total: 0, list: [] };
			}
		} catch (err) {
			return { total: 0, list: [] };
		}
	},
	getTrashList: async function (where, order, limit, offset) {
		const dbRead = databaseCast.dbRead();
		limit = limit > 1000 ? 1000 : limit;
		order = !order ? [{ column: 'id', order: 'ASC' }] : order;
		try {
			const total = (await dbRead.from(this.$table)
				.where(where)
				.whereNotNull('deleted_at')
				.count('id', { as: 'total' }).first())?.total || 0;
			if (total > 0) {
				const rows = await dbRead.select([...new Set([...this.$guarded, ...this.$fillable])])
					.from(this.$table)
					.where(where)
					.whereNotNull('deleted_at')
					// .orderByRaw('if(`sort`>0,1,0) DESC').orderBy([{ column: 'sort', order: 'ASC' }]) // 有排序sort字段时使用
					.orderBy(order)
					.limit(limit || 10)
					.offset(offset || 0)
					.then((rows) => {
						return rows.map(row => ({
							...row,
							created_at: moment(row.created_at).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
							updated_at: moment(row.updated_at).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
						}))
					})
					.catch(() => {
						return false;
					});
				return { total: total, list: rows };
			} else {
				return { total: 0, list: [] };
			}
		} catch (err) {
			return { total: 0, list: [] };
		}
	},
	save: async function (_data) {
		if (!_data) return;
		const dbWrite = databaseCast.dbWrite();
		const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 过滤不存在的字段
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
						await dbWrite(this.$table).update({ ...dataRow, updated_at: dbWrite.fn.now() }).where(function () {
							this.where('id', '>', 0)
							if (Array.isArray(dataRow.id)) {
								if (dataRow.id.length > 0) this.whereIn('id', dataRow.id);
							} else {
								this.where('id', dataRow.id);
							}
						});
						return Array.isArray(dataRow.id) ? dataRow.id : [dataRow.id];
					} else {
						return await dbWrite(this.$table).insert({ ...dataRow, created_at: dbWrite.fn.now(), updated_at: dbWrite.fn.now() });
					}
				});
			} catch (err) {
				return false;
			}
		}
	},
	restore: async function (where) {
		if (!where) return;
		const dbWrite = databaseCast.dbWrite();
		try {
			return await dbWrite(this.$table)
				.where(where)
				.update({
					deleted_at: null
				});
		} catch (err) {
			return false;
		}
	},
	softDelete: async function (where) {
		if (!where) return;
		const dbWrite = databaseCast.dbWrite();
		try {
			return await dbWrite(this.$table)
				.where(where)
				.update({
					deleted_at: dbWrite.fn.now()
				});
		} catch (err) {
			return false;
		}
	}
}
