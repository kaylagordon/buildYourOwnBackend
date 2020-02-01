const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const checkSection = (response, section) => {
  if (section !== 'categories' && section !== 'campaigns') {
    return response
    .status(422)
    .send({ error: `The section ${section} does not exist. The only sections are categories and campaigns.` });
  }
}

app.use(express.json());

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Kickstarter Campaigns';

app.get('/', (request, response) => {
  response.send('Welcome to the Kickstarter database!');
});

app.get('/api/v1/:section', async (request, response) => {
  const { section } = request.params;

  checkSection(response, section);

  try {
    const data = await database(`${section}`).select();
    response.status(200).json(data);
  } catch(error) {
    response.status(500).send({ error: `Internal Server Error: Something went wrong with your request. Please try again.` });
  };
});

app.get('/api/v1/:section/:id', async (request, response) => {
  const { section, id } = request.params;

  checkSection(response, section);

  try {
    const data = await database(`${section}`).select();
    const item = data.find(item => item.id === parseInt(id));

    if (!item) {
      return response.status(404).send({ error: `There is no item in the ${section} with an id of ${id}.` })
    };

    response.status(200).json(item);
  } catch(error) {
    response.status(500).send({ error: `Internal Server Error: Something went wrong with your request. Please try again.` });
  };
});

app.post('/api/v1/:section', async (request, response) => {
  const newItem = request.body;
  const { section } = request.params;
  let requiredParameters;

  checkSection(response, section);

  if (section === 'categories') {
    requiredParameters = ['category', 'category_link'];
  } else {
    requiredParameters = ['name', 'creator','category_id', 'location'];
  };

  for (var i = 0; i < requiredParameters.length; i++) {
    if (!newItem[requiredParameters[i]]) {
      return response
        .status(422)
        .send({ error: `Expected format: {${requiredParameters.map(param => ` ${param}: <String>`)} }. You are missing the ${requiredParameters[i]} property.` });
    };
  };

  if (section === 'campaigns') {
    const { category_id } = newItem;
    const categories = await database('categories').select();
    const matchingCategory = categories.find(category => category.id === category_id);

    if (!matchingCategory) {
      return response
        .status(422)
        .send({ error: `A category with an id of ${category_id} does not exist. You can only create campaigns in existing categories.` });
    };
  };

  database(`${section}`).insert(newItem, 'id')
    .then(response.status(201).json(newItem))
    .catch(response.status(500).send({ error: `Internal Server Error: Something went wrong with your request. Please try again.` }));
});

app.delete('/api/v1/:section', async (request, response) => {
  const { section } = request.params;
  const { id } = request.body;

  checkSection(response, section);

  if (section === 'categories') {
    return response
      .status(422)
      .send({ error: `You cannot delete a category. You can only delete an individual campaign.` });
  } else if (!id) {
      return response
      .status(422)
      .send({ error: `Expected format: { id: <Number> }. You are missing the id property.` });
  };

  const campaigns = await database(`campaigns`).select();
  const campaign = campaigns.find(campaign => campaign.id === parseInt(id));

  if (!campaign) {
    return response.status(404).send({ error: `There is no campaign with an id of ${id}.` })
  };

  database('campaigns')
    .where('id', parseInt(id))
    .del()
    .then(response.status(200).json(id))
    .catch(response.status(500).send({ error: `Internal Server Error: Something went wrong with your request. Please try again.` }));
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
