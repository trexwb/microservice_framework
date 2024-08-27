# 技术路径
## 安装
### 本地执行
node版本不低于16，建议使用最新的node版本
> `npm i` 或 `yarn install`

> `npx cross-env NODE_ENV=production knex migrate:latest` 首次执行，需要迁移数据库

> `npx cross-env NODE_ENV=production knex seed:run` 导入默认数据，请正式服务慎重操作

首次安装
> `npm install` 或 `yarn install`

本地执行
> `npm run dev` 或 `yarn run dev`

正式环境执行
> `npm run start` 或 `yarn run start`

## 密钥
用于接口调用本服务时的校验，建议每个微服务都带上密钥校验，预防安全隐患