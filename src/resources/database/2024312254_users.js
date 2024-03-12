exports.seed = async function (knex) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0');
    knex(`${process.env.DB_PREFIX}users`).del().then(function () {
        return knex(`${process.env.DB_PREFIX}users`).insert(
            [{"id":1,"nickname":"昵称","email":"trexwb@163.com","mobile":"13231111111","avatar":null,"password":"f8807ee63fd050b6f544a5d56acafd34","salt":"SAzeov","remember_token":"Y1odnITsRnuDbCKT9Fc8hZu7sqWUl0Sl","uuid":"3c20c080-0c7b-4678-8f8a-08edc2a6e8b6","secret":"mbWqR2iWrrT9JdUejkXmyVJ3G8NsXHGv","extension":null,"status":1,"created_at":"2024-01-22T09:56:08.000Z","updated_at":"2024-01-22T09:56:08.000Z","deleted_at":null}]
        );
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1');
};