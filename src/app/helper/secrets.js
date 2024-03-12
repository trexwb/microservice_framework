/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-03-11 13:49:36
 * @FilePath: /laboratory/microservice/account/src/app/helper/secrets.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
const cacheCast = require('@cast/cache');
const secretsModel = require('@model/secrets');

function buildWhere(that, where) {
	function applyWhereCondition(field, value) {
        if (Array.isArray(value)) {
            if (value.length > 0) that.whereIn(field, value);
        } else {
            that.where(field, value);
        }
    }
	that.where('id', '>', 0);
	if (where.id) {
		applyWhereCondition('id', where.id);
	}
	if (where.app_id) {
		applyWhereCondition('app_id', where.app_id);
	}
	if (where.status) {
		applyWhereCondition('status', where.status);
	}
	if (where.keywords) {
		that.where(function () {
			this.orWhere('channel', 'like', `%${where.keywords}%`);
			this.orWhere('app_id', 'like', `%${where.keywords}%`);
			this.orWhere('extension', 'like', `%${where.keywords}%`);
		});
	}
}

module.exports = {
	getAppId: async (appId) => {
		if (!appId) return;
		let secretRow = {};
		try {
			const cacheKey = `secrets[appid:${appId}]`;
			secretRow = await cacheCast.get(cacheKey);
			if (!secretRow?.id) {
				secretRow = await secretsModel.getRow(function () {
					buildWhere(this, {
						"app_id": appId
					})
				});
				if (secretRow?.id) {
					cacheCast.setCacheWithTags('secrets', cacheKey, secretRow)
				}
			}
		} catch (err) { }
		return secretRow;
	},
	getList: async (where, order, _page, _pageSize) => { // await secretsHelper.getList({keywords: '1',status: '0'});
		let rows = {};
		try {
			const page = Number(_page ?? 1);
			const pageSize = Number(_pageSize ?? 10);
			const offset = Number(!page ? 0 : pageSize * (page - 1));
			const cacheKey = `secrets[list:${JSON.stringify(where)},${JSON.stringify(order)},${page},${pageSize}]`;
			rows = await cacheCast.get(cacheKey);
			if (!rows?.total) {
				rows = await secretsModel.getList(function () {
					buildWhere(this, where)
				}, null, pageSize, offset);
				if (rows?.total) {
					cacheCast.setCacheWithTags('secrets', cacheKey, rows);
				}
			}
		} catch (err) { }
		return rows;
	},
	getId: async (id) => {
		if (!id) return {};
		let row = {};
		try {
			const cacheKey = `secrets[id:${id}]`;
			row = await cacheCast.get(cacheKey);
			if (!row?.id) {
				row = await secretsModel.getRow(function () {
					buildWhere(this, {
						"id": id
					})
				});
				if (row?.id) {
					cacheCast.setCacheWithTags('secrets', cacheKey, row);
				}
			}
		} catch (err) { }
		return row;
	},
	save: async (_data) => {
		if (!_data) return;
		let affects = {};
		try {
			affects = await secretsModel.save(_data);
			await cacheCast.clearCacheByTag('secrets');
		} catch (err) { }
		return affects;
	},
	restore: async (id) => {
		if (!id) return;
		let affects = {};
		try {
			affects = await secretsModel.restore(function () {
				buildWhere(this, {
					"id": id
				})
			});
			await cacheCast.clearCacheByTag('secrets');
		} catch (err) { }
		return affects;
	},
	delete: async (id) => {
		if (!id) return;
		let affects = {};
		try {
			affects = await secretsModel.softDelete(function () {
				buildWhere(this, {
					"id": id
				})
			});
			await cacheCast.clearCacheByTag('secrets');
		} catch (err) { }
		return affects;
	},
}
