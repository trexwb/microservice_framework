/*** 
 * @Author: trexwb
 * @Date: 2024-01-15 12:21:18
 * @LastEditors: trexwb
 * @LastEditTime: 2024-07-08 11:33:47
 * @FilePath: /drive/Users/wbtrex/website/localServer/node/damei/laboratory/microservice/account/src/utils/status.js
 * @Description: 
 * @一花一世界，一叶一如来
 * Copyright (c) 2024 by 杭州大美, All Rights Reserved. 
 */
'use strict';

// 200 OK: 请求成功，对于GET和POST请求的正常回应。
// 201 Created: 请求成功并且服务器创建了新的资源，常用于POST或PUT请求。
// 204 No Content: 服务器成功处理，但未返回内容。主要用于不需要返回内容的请求，如DELETE。
// 304 Not Modified: 资源未改变，主用于If-Modified-Since或If-None-Match的情况。
// 400 Bad Request: 请求参数有误，服务器无法解析。
// 401 Unauthorized: 请求需要用户验证，对于需要登录的网页或API，如果请求时没有登录或者登录超时，服务器可能会返回此响应。
// 403 Forbidden: 服务器理解请求客户端的请求，但是拒绝执行此请求。
// 404 Not Found: 请求的资源无法找到。
// 500 Internal Server Error: 服务器内部错误，无法完成请求。

module.exports = {
  statusMap: {
    200: 'Success',
    201: 'Created',
    204: 'No Content',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  },
  error: (msg) => {
    return {
      error: msg
    }
  },
  havePermissions: (role, permission, args) => {
    if (!args) return false;
    if (args.roles && Array.isArray(args.roles) && args.permissions && Array.isArray(args.permissions)) {
      return args.roles.includes(role) && args.permissions.includes(`${role}:${permission}`);
    }
    return false;
  },
  getContext: (args) => {
    const context = (typeof args[args.length - 1] === 'object' && args[args.length - 1] !== null) ? args.pop() || null : null;
    return { params: args, context: context };
    // let paramsData = {
    //   ...params.reduce((acc, curr) => {
    //     acc[curr] = null;
    //     return acc;
    //   }, {}),
    //   ...args.reduce((acc, curr, index) => {
    //     acc[params[index]] = curr;
    //     return acc;
    //   }, {})
    // };
    // for (let i = args.length - 1; i >= 0; i--) {
    //   if (typeof args[i] === 'object' && args[i] !== null) {
    //     paramsData.context = args[i];
    //     return paramsData;
    //   }
    // }
    // return paramsData;
  }
};
