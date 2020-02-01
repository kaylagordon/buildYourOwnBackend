# Build Your Own Backend
### Background
This is the first server and database I've built! I used **Express** as a framework on top of **Node.js** to handle the routes. I used **Knex** to make SQL queries. I built the database using **PostgreSQL**. The database hold data on Kickstarter campaigns.

If you would like to see a line-by-line explanation of the methods in the `server.js` file, open that file in the `articulation` branch of this project (or [click here](https://github.com/kaylaewood/buildYourOwnBackend/blob/articulation/server.js)).

### API Documentation
All API endpoints are prefixed with either `http://localhost:3000` or `https://buildyourownbackend.herokuapp.com/`.

Wherever you see a `:id` in the URL, you will want to replace that with a number that matches the id of the category or campaign you are trying to target.

#### Here are the endpoints and methods available:

|Purpose|URL|Verb|Request Body|Sample Response (Happy Path)|
|:-:|:-:|:-:|:-:|:-:|
|Get all categories|`/api/v1/categories`|GET|N/A|All the categories in the database in an array: `[{ "id": 1, "category_link": "someURL", "created_at": "2020-01-29T22:14:33.374Z", "updated_at": "2020-01-29T22:14:33.374Z", "category": "art" }, ...]`|
|Get all campaigns|`/api/v1/campaigns`|GET|N/A|All the campaigns in the database in an array: `[{ "id": 7, "name": "Some Product", "creator": "Kayla Wood", "location": "Denver, CO", "category_id": 1, "created_at": "2020-02-01T18:15:52.472Z", "updated_at": "2020-02-01T18:15:52.472Z" }, ...]` NOTE: The `category_id` connects each campaign to a category. For each campaign, its `category_id` is equal to one `category.id`.|
|Get one category|`/api/v1/categories/:id`|GET|N/A|The category object that matches the id given in the URL: `{ "id": 1, "category_link": "someURL", "created_at": "2020-01-29T22:14:33.374Z", "updated_at": "2020-01-29T22:14:33.374Z", "category": "art" }`|
|Get one campaign|`/api/v1/campaigns/:id`|GET|N/A|The campaign object that matches the id given in the URL: `{ "id": 7, "name": "Some Product", "creator": "Kayla Wood", "location": "Denver, CO", "category_id": 1, "created_at": "2020-02-01T18:15:52.472Z", "updated_at": "2020-02-01T18:15:52.472Z" }`|
|Submit a new category|`/api/v1/categories`|POST|`{ category: <String>, category_link: <String> }`|The category object that was created (with its id): `{ "category": "someCategory", "category_link": "someURL", "id": 8 }`|
|Submit a new campaign|`/api/v1/campaigns`|POST|`{ name: <String>, creator: <String>, category_id: <String>, location: <String> }`|The campaign object that was created (with its id): `{ "name": "Another Product", "creator": "Kayla Wood", "category_id": 3, "location": "Columbus, Ohio", "id": 16 }`|
|Delete a campaign|`/api/v1/campaigns`|DELETE|`{ id: <Number> }`| The id, as a number, of the deleted campaign: `12`|
