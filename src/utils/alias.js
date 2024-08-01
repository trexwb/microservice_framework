/*
 * @Author: trexwb
 * @Date: 2023-12-30 08:48:12
 * @LastEditTime: 2023-12-30 08:48:53
 * @LastEditors: trexwb
 * @Description: In User Settings Edit
 * @FilePath: /node/damei/laboratory/applications/drive/src/utils/alias.js
 * 一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const path = require('path');

let aliasMap = {};

// 读取package.json文件
const packageJson = require('@root/package.json');
// 获取 _moduleAliases 值
const aliases = packageJson._moduleAliases;
// 遍历并打印每个别名和对应的路径
for (const alias in aliases) {
	// aliasMap[alias] = path.resolve(__dirname, aliases[alias]);
	aliasMap[alias] = path.resolve(process.cwd(), aliases[alias]);
}

// 创建一个函数来查找和替换别名
const resolve = (filePath) => {
	for (const alias in aliasMap) {
		if (filePath.startsWith(alias)) {
			return path.join(aliasMap[alias], filePath.slice(alias.length));
		}
	}
	return filePath;
}

module.exports = {
	resolve: resolve
}