
exports.up = function (knex) {
  return knex.schema
    .createTable('categories', function (table) {
      table.increments('id').primary();
      table.string('category_link');
      table.timestamps(true, true);
    })
    .createTable('campaigns', function (table) {
      table.increments('id').primary();
      table.string('name');
      table.string('creator');
      table.string('location');
      table.integer('category_id').unsigned()
      table.foreign('category_id')
        .references('categories.id');
      table.timestamps(true, true);
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('campaigns')
    .dropTable('categories')
};
