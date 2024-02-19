exports.up = knex => knex.schema.createTable("ingredients", table => {
    table.increments("id");
    table.text("name")
    table.integer("dishes_id").references("id").inTable("dishes").onDelete("CASCADE");

    table.timestamp("created_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable("ingredients");
