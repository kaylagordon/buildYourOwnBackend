const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

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



app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
