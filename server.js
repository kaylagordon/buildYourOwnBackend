const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(express.json());

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Kickstarter Campaigns';

app.get('/', (request, response) => {
  response.send('Welcome to the Kickstarter database!');
});

app.get('/api/v1/categories', async (request, response) => {
  try {
    const categories = await database('categories').select();
    response.status(200).json(categories);
  } catch(error) {
    response.status(500).json({ error });
  }
});

app.get('/api/v1/campaigns', async (request, response) => {
  try {
    const campaigns = await database('campaigns').select();
    response.status(200).json(campaigns);
  } catch(error) {
    response.status(500).json({ error });
  }
});

app.get('/api/v1/categories/:id', async (request, response) => {
  const { id } = request.params;
  const categories = await database('categories').select();
  const category = categories.find(category => category.id === parseInt(id));
  if (!category) {
    return response.sendStatus(404);
  }

  response.status(200).json(category);
});

app.get('/api/v1/campaigns/:id', async (request, response) => {
  const { id } = request.params;
  const campaigns = await database('campaigns').select();
  const campaign = campaigns.find(campaign => campaign.id === parseInt(id));
  if (!campaign) {
    return response.sendStatus(404);
  }

  response.status(200).json(campaign);
});

app.post('/api/v1/categories', (request, response) => {
  const newCategory = request.body;

  for (let requiredParameter of ['category', 'category_link']) {
    if (!newCategory[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { category: <String>, category_link: <String> }. You are missing the ${requiredParameter} property.` });
    }
  }

  database('categories').insert(newCategory, 'id')
    .then(response.status(201).json(newCategory))
    .catch(response.status(500).send({ error: `Internal Server Error: Something went wrong with your request. Please try again.` }));
});

app.post('/api/v1/campaigns', async (request, response) => {
  const newCampaign = request.body;

  for (let requiredParameter of ['name', 'creator','category_name', 'location']) {
    if (!newCampaign[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { name: <String>, creator: <String>, category_name: <String>, location: <String> }. You are missing the ${requiredParameter} property.` });
    }
  }

  const { name, creator, category_name, location } = newCampaign;
  const categories = await database('categories').select();

  const matchingCategory = categories.find(category => category.category === category_name);

  if (!matchingCategory) {
    return response
      .status(422)
      .send({ error: `The category of ${category_name} does not exist. You can only create campaigns in existing categories.` });
  }

  database('campaigns').insert({
    name,
    creator,
    location,
    category_id: matchingCategory.id
  }, 'id')
    .then(response.status(201).json(newCampaign))
    .catch(response.status(500).send({ error: `Internal Server Error: Something went wrong with your request. Please try again.` }));
});

app.delete('/api/v1/campaigns', (request, response) => {
  const { id } = request.body;

  if (!id) {
    return response
      .status(422)
      .send({ error: `Expected format: { id: <Number> }. You are missing the id property.` });
  }

  database('campaigns')
    .where('id', parseInt(id))
    .del()
    .then(response.status(200).json(id))
    .catch(response.status(500).send({ error: `Internal Server Error: Something went wrong with your request. Please try again.` }));
});

app.delete('/api/v1/categories', (request, response) => {
  return response
    .status(422)
    .send({ error: `You cannot delete a category. You can only delete an individual campaign.` });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
