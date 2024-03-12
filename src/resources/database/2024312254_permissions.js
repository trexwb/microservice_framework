exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    knex(`${process.env.DB_PREFIX}permissions`).del().then(function () {
        return knex(`${process.env.DB_PREFIX}permissions`).insert(
            [{"id":1,"site_id":"2","name":"简易CMS全权","extension":["simpleCMSLanguages:read","simpleCMSLanguages:write","simpleCMSLanguages:delete","simpleCMSCustoms:read","simpleCMSCustoms:write","simpleCMSCustoms:delete","simpleCMSColumns:read","simpleCMSColumns:write","simpleCMSColumns:delete","simpleCMSCategories:read","simpleCMSCategories:write","simpleCMSCategories:delete","simpleCMSArticles:read","simpleCMSArticles:write","simpleCMSArticles:delete"],"status":1,"created_at":"2024-01-24T06:06:16.000Z","updated_at":"2024-01-24T06:06:16.000Z","deleted_at":null},{"id":2,"site_id":"2","name":"附件管理全权","extension":["attachmentConfigs:read","attachmentConfigs:write","attachmentConfigs:delete","attachmentFiles:read","attachmentFiles:write","attachmentFiles:delete"],"status":1,"created_at":"2024-01-24T06:06:16.000Z","updated_at":"2024-01-24T06:06:16.000Z","deleted_at":null}]
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};