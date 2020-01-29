exports.up = function(knex) {
  return knex.schema.table('categories', function(table) {
    table.string('category');
  })
};

exports.down = function(knex) {
  return knex.schema.table('categories', function(table) {
    table.dropColumn('category');
  })
};
