const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const throwError = (response, statusCode, message) => {
  return response.status(statusCode).send({ error: message });
}

const checkSection = (response, section) => {
  if (section !== 'categories' && section !== 'campaigns') {
    throwError(response, 422, `The section ${section} does not exist. The only sections are categories and campaigns.`);
  }
};

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
    throwError(response, 500, 'Internal Server Error: Something went wrong with your request. Please try again.');
  };
});

app.get('/api/v1/:section/:id', async (request, response) => {
  const { section, id } = request.params;

  checkSection(response, section);

  try {
    const data = await database(`${section}`).select();
    const item = data.find(item => item.id === parseInt(id));

    if (!item) {
      throwError(response, 404, `There is no item in the ${section} with an id of ${id}.`);
    };

    response.status(200).json(item);
  } catch(error) {
    throwError(response, 500, `Internal Server Error: Something went wrong with your request. Please try again.`);
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
      throwError(response, 422, `Expected format: {${requiredParameters.map(param => ` ${param}: <String>`)} }. You are missing the ${requiredParameters[i]} property.`);
    };
  };

  if (section === 'campaigns') {
    const { category_id } = newItem;
    const categories = await database('categories').select();
    const matchingCategory = categories.find(category => category.id === category_id);

    if (!matchingCategory) {
      throwError(response, 422, `A category with an id of ${category_id} does not exist. You can only create campaigns in existing categories.`);
    };
  };

  let newItemId = await database(`${section}`).insert(newItem, 'id')

  if (!newItemId) {
    throwError(response, 500, `Internal Server Error: Something went wrong with your request. Please try again.`);
  } else {
    response.status(201).json({...newItem, id: newItemId[0]})
  }
});

app.delete('/api/v1/:section', async (request, response) => {
  const { section } = request.params;
  const { id } = request.body;

  checkSection(response, section);

  if (section === 'categories') {
    throwError(response, 422, `You cannot delete a category. You can only delete an individual campaign.`);
  } else if (!id) {
    throwError(response, 422, `Expected format: { id: <Number> }. You are missing the id property.`);
  };

  const campaigns = await database(`campaigns`).select();
  const campaign = campaigns.find(campaign => campaign.id === parseInt(id));

  if (!campaign) {
    throwError(response, 404, `There is no campaign with an id of ${id}.`);
  };

  database('campaigns')
    .where('id', parseInt(id))
    .del()
    .then(response.status(200).json(id))
    .catch(throwError(response, 500, `Internal Server Error: Something went wrong with your request. Please try again.`));
});

app.get('*', (request, response) => {
  throwError(response, 404, '404: Not found');
});

app.post('*', (request, response) => {
  throwError(response, 404, '404: Not found');
});

app.delete('*', (request, response) => {
  throwError(response, 404, '404: Not found');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
