const express = require('express'); //import Express framework
const app = express(); //let app represent the invokation of express
const environment = process.env.NODE_ENV || 'development'; //when this application is running in Heroku, it will recognize that it is in the production environment. Otherwise, it will default to development environment.
const configuration = require('./knexfile')[environment]; //import the environment settings from the knexfile
const database = require('knex')(configuration); //using the environment settings, connect to the database via knex

const throwError = (response, statusCode, message) => {
  return response.status(statusCode).send({ error: message }); //return a response object with an error status code and an error message
}

const checkSection = (response, section) => {
  if (section !== 'categories' && section !== 'campaigns') { //if the section is something other than categories or campaigns...
    throwError(response, 422, `The section ${section} does not exist. The only sections are categories and campaigns.`); //invoke throwError with an error code of 422 and a message that says the section does not exist
  }
};

app.use(express.json()); //ensure that the app parses the request body to json by default

app.set('port', process.env.PORT || 3000); //set the port to whatever is in the environment variable PORT (i.e. if coming from Heroku) or default to 3000

app.locals.title = 'Kickstarter Campaigns'; //in the app.locals object, create a key:value pair of title: 'Kickstarter Campaigns'

app.get('/', (request, response) => { //if a GET request comes from '/'...
  response.send('Welcome to the Kickstarter database!'); //return a string with a welcome message
});

app.get('/api/v1/:section', async (request, response) => { //if a GET request comes for a specifed section...
  const { section } = request.params; //deconstruct section from the URL (found in the request.params object)

  checkSection(response, section); //invoke checkSection to ensure the section is either categories or campaigns

  try { //try this code block first
    const data = await database(`${section}`).select(); //wait for all of the data to come in from the appropriate table and assign to variable data
    response.status(200).json(data); //send a response object with a success status code and all of the data
  } catch(error) { //if something goes wrong in the try block...
    throwError(response, 500, 'Internal Server Error: Something went wrong with your request. Please try again.'); //invoke throwError to indicate something went wrong on the server side
  };
});

app.get('/api/v1/:section/:id', async (request, response) => { //if a GET request comes for a specified section and id...
  const { section, id } = request.params; //deconstruct section and id from the URL (found in the request.params object)

  checkSection(response, section); //invoke checkSection to ensure the section is either categories or campaigns

  try { //try this code block first
    const data = await database(`${section}`).select(); //wait for all of the data to come in from the appropriate table and assign to variable data
    const item = data.find(item => item.id === parseInt(id)); //find the item in the data array that has the same id as the one sent in the URL and assign it to variable id

    if (!item) { //if there is no item that matches the id...
      throwError(response, 404, `There is no item in the ${section} with an id of ${id}.`); //invoke throwError with a failed status code and a message that indicates there is no item with that id
    };

    response.status(200).json(item); //send a response object with a success status code and the found item
  } catch(error) { //if something goes wrong in the try block...
    throwError(response, 500, `Internal Server Error: Something went wrong with your request. Please try again.`); //invoke throwError to indicate something went wrong on the server side
  };
});

app.post('/api/v1/:section', async (request, response) => { //if a POST request comes in for a specified section...
  const newItem = request.body; //assign the body of the request to variable newItem
  const { section } = request.params; //deconstruct section from the URL (found in the request.params object)
  let requiredParameters; //create variable requiredParameters

  checkSection(response, section); //invoke checkSection to ensure the section is either categories or campaigns

  if (section === 'categories') { //if the section is categories...
    requiredParameters = ['category', 'category_link']; //assign requiredParameters to an array of strings of necessary properties to POST a new category
  } else { //if the section is campaigns...
    requiredParameters = ['name', 'creator','category_id', 'location']; //assign requiredParameters to an array of strings of necessary properties to POST a new campaign
  };

  for (var i = 0; i < requiredParameters.length; i++) { //iterate through requiredParameters
    if (!newItem[requiredParameters[i]]) { //if one of the requiredParameters is missing...
      throwError(response, 422, `Expected format: {${requiredParameters.map(param => ` ${param}: <String>`)} }. You are missing the ${requiredParameters[i]} property.`); //invoke throwError with a failed status code and a message that indicates what the body of the POST request should have looked like and which was missing (will only show first property that was missing)
    };
  };

  if (section === 'campaigns') { //if the section is campaigns...
    const { category_id } = newItem; //deconstruct category_id from the URL (found in the request.params object)
    const categories = await database('categories').select(); //wait for all of the data to come in from the categories table and assign to variable categories
    const matchingCategory = categories.find(category => category.id === category_id); //find the category that matches the category of the campaign that is trying to be POSTed

    if (!matchingCategory) { //if the category does not exist...
      throwError(response, 422, `A category with an id of ${category_id} does not exist. You can only create campaigns in existing categories.`); //invoke throwError with a failed status code and a message that indicates that you cannot create a campaign for a category that does not exist
    };
  };

  database(`${section}`).insert(newItem, 'id') //insert the newItem into the appropriate table in the database
    .then(response.status(201).json(newItem)) //then send a response object with a success status code and the item object that was added
    .catch(throwError(response, 500, `Internal Server Error: Something went wrong with your request. Please try again.`)); //if somethings went wrong, invoke throwError to indicate something went wrong on the server side
});

app.delete('/api/v1/:section', async (request, response) => { //if a DELETE request comes in for a specified section...
  const { section } = request.params; //deconstruct section from the URL (found in the request.params object)
  const { id } = request.body; //deconstruct id from the request.body object

  checkSection(response, section); //invoke checkSection to ensure the section is either categories or campaigns

  if (section === 'categories') { //if the section is categories...
    throwError(response, 422, `You cannot delete a category. You can only delete an individual campaign.`); //invoke throwError to with a failed status code and a message to let the user know they cannot create a new category
  } else if (!id) { //if the section is campaigns but there is no id in the request body...
    throwError(response, 422, `Expected format: { id: <Number> }. You are missing the id property.`); //invoke throwError to with a failed status code and a message to let the user know they need to include an id in the body of the DELETE request
  };

  const campaigns = await database(`campaigns`).select(); //wait for all of the data to come in from the campaigns table and assign to variable campaigns
  const campaign = campaigns.find(campaign => campaign.id === parseInt(id)); //find the campaign that matches the id from the DELETE request body

  if (!campaign) { //if no campaign matches the id...
    throwError(response, 404, `There is no campaign with an id of ${id}.`); //invoke throwError to with a failed status code and a message to let the user know there is no campaign with that id
  };

  database('campaigns') //in the campaigns table...
    .where('id', parseInt(id)) //find the campaign that matches the id from the DELETE request body...
    .del() //and delete it
    .then(response.status(200).json(id)) //then send a response object with a success status code and the id of the deleted campaign
    .catch(throwError(response, 500, `Internal Server Error: Something went wrong with your request. Please try again.`)); //if something goes wrong, invoke throwError to indicate something went wrong on the server side
});

app.get('*', (request, response) => { //if a GET request comes from any URL other than what has been specified so far...
  throwError(response, 404, '404: Not found'); //invoke throwError to with a failed status code and a message to let the user know the URL they have entered does not exist
});

app.post('*', (request, response) => { //if a POST request comes from any URL other than what has been specified so far...
  throwError(response, 404, '404: Not found'); //invoke throwError to with a failed status code and a message to let the user know the URL they have entered does not exist
});

app.delete('*', (request, response) => { //if a DELETE request comes from any URL other than what has been specified so far...
  throwError(response, 404, '404: Not found'); //invoke throwError to with a failed status code and a message to let the user know the URL they have entered does not exist
});

app.listen(app.get('port'), () => { //listen to the port
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`); //log a message that lets the user know which port "Kickstarter Campaigns" is running on
});
