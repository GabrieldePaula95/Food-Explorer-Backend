const knex = require("../database/knex");

class NotesController{
    async create(request, response){
        const { dish, price, description, category, ingredients } = request.body;
        const { user_id } = request.params;

        const [dishes_id] = await knex("dishes").insert({
            dish,
            description,
            price,
            user_id
        });

                   
        await knex("category").insert({name: category, dishes_id: dishes_id});

        const ingredientsInsert = ingredients.map(name => {
            return {
                dishes_id,
                name,
            }
        });

        await knex("ingredients").insert(ingredientsInsert);

        response.json();
    }

    async show(request, response){
        const { id } = request.params;

        const dishes =  await knex("dishes").where({ id }).first();
        const ingredients = await knex("ingredients").where({ dishes_id: id }).orderBy("name");
        return response.json({
            ...dishes,
            ingredients
        });
    }

    async delete(request, response){
        const { id } = request.params;

        await knex("dishes").where({ id }).delete();

        return response.json();
    }

    async index(request, response){
        const { dish, ingredients } = request.query;

        let dishes;

        if(ingredients){
            const filterIngredients = ingredients.split(",").map(ingredients => ingredients.trim());

            dishes = await knex("ingredients")
                .select([
                     "dishes.id",
                     "dishes.dish",
                     "dishes.description",
                     "dishes.user_id"
                ])
                .whereLike("dishes.dish", `%${dish}%`)
                .whereIn("name", filterIngredients)
                .innerJoin("dishes", "dishes.id", "ingredients.dishes_id")
                .orderBy("dishes.dish")
        } else { 
            dishes = await knex("dishes")
            .whereLike("dish", `%${dish}%`)
            .orderBy("dish");
        }

        const userIngredients = await knex("ingredients");
        const dishesWithIngredients = dishes.map(dishes => {
            const dishesIngredients = userIngredients.filter(ingredients => ingredients.dishes_id === dishes.id);

            return {
                ...dishes,
                ingredients: dishesIngredients
            }
        });

        return response.json({ dishesWithIngredients });
    }
}

module.exports = NotesController;