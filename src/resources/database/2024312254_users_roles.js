exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    knex(`${process.env.DB_PREFIX}users_roles`).del().then(function () {
        return knex(`${process.env.DB_PREFIX}users_roles`).insert(
            [{"site_id":"2","user_id":1,"role_id":1}]
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};