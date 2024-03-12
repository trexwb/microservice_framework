exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    knex(`${process.env.DB_PREFIX}roles_permissions`).del().then(function () {
        return knex(`${process.env.DB_PREFIX}roles_permissions`).insert(
            [{"site_id":"2","role_id":1,"permission_id":1}]
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};