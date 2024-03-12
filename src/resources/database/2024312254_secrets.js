exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    knex(`${process.env.DB_PREFIX}secrets`).del().then(function () {
        return knex(`${process.env.DB_PREFIX}secrets`).insert(
            [{"id":1,"channel":"超管","app_id":"9924346402088699","app_secret":"E1xCKSrjBFV8ldhTMnSruv3HqvJQjY8Q","permissions":{"roles":["accountRoles","accountPermissions","accountUsers"],"permissions":["accountRoles:read","accountRoles:write","accountRoles:delete","accountPermissions:read","accountPermissions:write","accountPermissions:delete","accountUsers:read","accountUsers:write","accountUsers:delete"]},"extension":{"analysis":{"accountRoles":{"name":"角色管理","permissions":{"read":"只读","write":"可写","delete":"删除"}},"accountUsers":{"name":"用户管理","permissions":{"read":"只读","write":"可写","delete":"删除"}},"accountPermissions":{"name":"权限管理","permissions":{"read":"只读","write":"可写","delete":"删除"}}}},"status":1,"created_at":"2024-01-18T04:12:29.000Z","updated_at":"2024-01-18T04:12:29.000Z","deleted_at":null}]
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};