
### API Documentation
All API endpoints (also known as “routes”) are prefixed with either `d` or `d`. Wherever you see a :id in the endpoint documentation, you will want to replace that with a number, representing the id of the category or campaign you are trying to target.

#### Here are the endpoints and methods available:

|Purpose|URL|Verb|Request Body|Sample Response (Happy Path)|
|:-:|:-:|:-:|:-:|:-:|
|Get all categories|`/api/v1/categories`|GET|N/A|All the categories in the database: `[{ "id": 1, "category_link": "someURL", "created_at": "2020-01-29T22:14:33.374Z", "updated_at": "2020-01-29T22:14:33.374Z", "category": "art" }, ...]`|
|Get all campaigns|`/api/v1/campaigns`|GET|N/A|All the campaigns in the database: `[{ "id": 7, "name": "Some Product", "creator": "Kayla Wood", "location": "Denver, CO", "category_id": 1, "created_at": "2020-02-01T18:15:52.472Z", "updated_at": "2020-02-01T18:15:52.472Z" }, ...]` NOTE: The `category_id` connects each campaign to a category. For each campaign, its `category_id` is equal to one `category.id`.|
|Get one category|`/api/v1/categories/:id`|GET|N/A|The category that matches the id given in the URL: `{ "id": 1, "category_link": "someURL", "created_at": "2020-01-29T22:14:33.374Z", "updated_at": "2020-01-29T22:14:33.374Z", "category": "art" }`|
|Get one campaign|`/api/v1/campaigns/:id`|GET|N/A|The campaign that matches the id given in the URL: `{ "id": 7, "name": "Some Product", "creator": "Kayla Wood", "location": "Denver, CO", "category_id": 1, "created_at": "2020-02-01T18:15:52.472Z", "updated_at": "2020-02-01T18:15:52.472Z" }`|
|Submit a new category|`/api/v1/categories`|POST|`{ category: <String>, category_link: <String> }`|The category that was created (with its id): `{ "name": 16412, "creator": "kayla", "category_id": 307, "location": "ohio", "id": 326 }`|
|Submit a new campaign|`/api/v1/campaigns`|POST|`{ name: <String>, creator: <String>, category_id: <String>, location: <String> }`|The campaign that was created (with its id): `{ "name": "Another Product", "creator": "Kayla Wood", "category_id": 3, "location": "Columbus, Ohio", "id": 16 `|
|Delete a campaign|`/api/v1/campaigns`|DELETE|`{ id: <Number> }`| The id of the deleted campaign: `12`|
