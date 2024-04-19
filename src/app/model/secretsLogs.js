/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-04-16 17:57:57
 * @FilePath: /laboratory/Users/wbtrex/website/localServer/node/damei/package/node/microservice_framework/src/app/model/secretsLogs.js
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
	return date ? moment(date).tz(timezone).format(format) : null;
};

const secretsLogsModel = {
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
					if (row) {
						row.created_at = formatDateTime(row?.created_at, SHANGHAI_TZ, FORMAT);
						row.updated_at = formatDateTime(row?.updated_at, SHANGHAI_TZ, FORMAT);
					}
					return JSON.parse(JSON.stringify(row));
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
	save: async function (data) {
		if (!data) return;
		const dbWrite = databaseCast.dbWrite();
		const keysArray = [...this.$fillable, ...this.$guarded, ...this.$hidden]; // 这是你的键数组
		const dataRow = keysArray.reduce((result, key) => {
			// 确保data[key]存在且为可转换类型
			if (data.hasOwnProperty(key) && data[key] !== null && data[key] !== undefined) {
				const castType = this.$casts[key];
				if (castType === 'json') {
					result[key] = utils.safeJSONStringify(data[key]);
				} else if (castType === 'integer') {
					result[key] = utils.safeCastToInteger(data[key]);
				} else if (castType === 'datetime') {
					result[key] = data[key] ? utils.dateFormatter(data[key], 'Y-m-d H:i:s', 1, false) : null;
				} else if (data[key] !== null && data[key] !== undefined) { // 添加对 data[key] 的非空检查
					result[key] = data[key].toString();
				} else {
					delete result[key];
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
			} catch (error) {
				logCast.writeError(__filename + ':' + error.toString());
				return false;
			}
		}
	}
}

module.exports = secretsLogsModel;