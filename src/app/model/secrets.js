/*** 
 * @Author: trexwb
 * @Date: 2024-01-29 08:30:55
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-19 16:24:44
 * @FilePath: /laboratory/microservice/payment/src/app/model/secrets.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
const databaseCast = require('@cast/database');
const utils = require('@utils/index');
const logCast = require('@cast/log');
const moment = require('moment-timezone');

const DEFAULT_LIMIT = 10; // 默认分页限制
const MAX_LIMIT = 1000; // 最大分页限制
const SHANGHAI_TZ = 'Asia/Shanghai'; // 时区常量
const FORMAT = 'YYYY-MM-DD HH:mm:ss'; // 日期格式常量

// 抽象日期格式化功能
const formatDateTime = (date, timezone = SHANGHAI_TZ, format = FORMAT) => {
	return moment(date).tz(timezone).format(format);
};

const secretsModel = {
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
	// 抽象出通用的数据库查询逻辑
	getRowOrTrashRow: async function (where, deletedAtQuery) {
		const dbRead = databaseCast.dbRead();
		try {
			const query = dbRead.select([...new Set([...this.$guarded, ...this.$fillable, ...this.$hidden])])
				.from(this.$table)
				.where(where);
			// 根据是否删除来添加相应的查询条件
			if (deletedAtQuery) query.whereNotNull('deleted_at');
			else query.whereNull('deleted_at');
			return await query.first()
				.then((row) => {
					row.created_at = formatDateTime(row.created_at, SHANGHAI_TZ, FORMAT);
					row.updated_at = formatDateTime(row.updated_at, SHANGHAI_TZ, FORMAT);
					return row;
				})
				.catch((error) => {
					logCast.writeError(__filename + ':' + error.toString());
					return false;
				});
		} catch (error) {
			logCast.writeError(__filename + ':' + error.toString());
			return false;
		}
	},
	getRow: async function (where) {
		return await this.getRowOrTrashRow(where, false);
	},
	getTrashRow: async function (where) {
		return await this.getRowOrTrashRow(where, true);
	},
	getListOrTrashList: async function (where, order, limit, offset, deletedAtQuery) {
		const dbRead = databaseCast.dbRead();
		limit = limit > MAX_LIMIT ? MAX_LIMIT : limit || DEFAULT_LIMIT;
		order = !order ? [{ column: 'id', order: 'ASC' }] : order;
		try {
			const queryTotal = dbRead.from(this.$table).where(where);
			// 根据是否删除来添加相应的查询条件
			if (deletedAtQuery) queryTotal.whereNotNull('deleted_at');
			else queryTotal.whereNull('deleted_at');
			const total = await queryTotal.count('id', { as: 'total' })
				.first()
				.then((row) => {
					return row.total || 0;
				}).catch(() => {
					return 0;
				});
			if (total > 0) {
				const queryRows = dbRead.from(this.$table).where(where);
				// 根据是否删除来添加相应的查询条件
				if (deletedAtQuery) queryRows.whereNotNull('deleted_at');
				else queryRows.whereNull('deleted_at');
				if (order) queryRows.orderBy(order)
				// else queryRows.orderByRaw('if(`sort`>0,1,0) DESC,sort ASC').orderBy([{ column: 'sort', order: 'ASC' }]);
				const rows = await queryRows.select([...new Set([...this.$guarded, ...this.$fillable])])
					.limit(limit)
					.offset(offset || 0)
					.then((rows) => {
						return rows.map(row => ({
							...row,
							created_at: formatDateTime(row.created_at, SHANGHAI_TZ, FORMAT),
							updated_at: formatDateTime(row.updated_at, SHANGHAI_TZ, FORMAT),
						}));
					})
					.catch((error) => {
						logCast.writeError(__filename + ':' + error.toString());
						return [];
					});
				return { total: total, list: rows };
			} else {
				return { total: 0, list: [] };
			}
		} catch (error) {
			logCast.writeError(__filename + ':' + error.toString());
			return { total: 0, list: [] };
		}
	},
	getList: async function (where, order, limit, offset) {
		return await this.getListOrTrashList(where, order, limit, offset, false);
	},
	getTrashList: async function (where, order, limit, offset) {
		return await this.getListOrTrashList(where, order, limit, offset, true);
	},
	save: async function (data) {
		if (!data) return;
		const dbWrite = databaseCast.dbWrite();
		const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 过滤不存在的字段
		const dataRow = keysArray.reduce((result, key) => {
			if (data.hasOwnProperty(key)) {
				if (this.$casts[key] === 'json') {
					result[key] = JSON.stringify(data[key]);
				} else if (this.$casts[key] === 'integer') {
					result[key] = Number(data[key]);
				} else if (this.$casts[key] === 'datetime') {
					result[key] = data[key] ? utils.dateFormatter(data[key], 'Y-m-d H:i:s', 1, false) : null;
				} else {
					result[key] = data[key];
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
			} catch (error) {
				logCast.writeError(__filename + ':' + error.toString());
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
		} catch (error) {
			logCast.writeError(__filename + ':' + error.toString());
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
		} catch (error) {
			logCast.writeError(__filename + ':' + error.toString());
			return false;
		}
	}
}

module.exports = secretsModel;