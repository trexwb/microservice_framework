/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 16:49:29
 * @LastEditors: trexwb
 * @LastEditTime: 2024-02-29 18:52:13
 * @FilePath: /laboratory/microservice/account/src/app/middleware/route.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
// const path = require('path');
// const fs = require('fs');


module.exports = {
	controller: (server) => {
		const glob = require('glob');
		const alias = require('@utils/alias');
		const files = glob.sync(`${alias.resolve(`@controller`)}/*.js`);
		server.passContext = true;
		files.forEach(file => {
			const route = require(file);
			// server.addFunctions([...Object.keys(route)]);
			Object.keys(route).forEach(key => {
				server.addFunction(route[key]);
			});
		});
		// fs.readdirSync(dirPath).forEach(file => {
		// 	const fullPath = path.join(dirPath, file);
		// 	const route = require(fullPath);
		// 	Object.keys(route).forEach(key => {
		// 		server.addFunction(route[key]);
		// 	});
		// });
	}
}