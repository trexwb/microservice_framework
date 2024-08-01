/*** 
 * @Author: trexwb
 * @Date: 2024-01-17 19:33:14
 * @LastEditors: trexwb
 * @LastEditTime: 2024-05-11 21:17:31
 * @FilePath: /laboratory/microservice/account/src/utils/cryptTool.js
 * @Description: 
 * @一花一世界，一叶一如来
 * @Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

const crypto = require('crypto');
const md5 = (str) => {
	const md5 = crypto.createHash('md5');
	md5.update(str);
	return md5.digest('hex');
}

// 加密函数
const encrypt = (encryptedData, key, iv) => {
	try {
		const encryptedText = JSON.stringify(encryptedData);
		const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
		let encrypted = cipher.update(encryptedText, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return encrypted;
	} catch (error) {
		return false;
	}
}
// 解密函数
const decrypt = (encryptedText, key, iv) => {
	try {
		const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
		let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return JSON.parse(decrypted);
	} catch (error) {
		return false;
	}
}

module.exports = {
	md5,
	encrypt,
	decrypt
}