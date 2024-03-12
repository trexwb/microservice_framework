exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    knex(`${process.env.DB_PREFIX}roles`).del().then(function () {
        return knex(`${process.env.DB_PREFIX}roles`).insert(
            [{"id":1,"site_id":"2","name":"管理员","extension":["simpleCMSLanguages","simpleCMSCustoms","simpleCMSColumns","simpleCMSCategories","simpleCMSArticles","attachmentConfigs","attachmentFiles"],"status":1,"created_at":"2024-01-24T02:50:09.000Z","updated_at":"2024-01-24T02:50:09.000Z","deleted_at":null}]
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};