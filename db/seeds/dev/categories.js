const simplifiedData = require('../../../data');

const createCategory = async (knex, category) => {
  const categoryId = await knex('categories').insert({
    category: category.category,
    category_link: category.category_link
  }, 'id');

  let campaignPromises = category.campaigns.map(campaign => {
    return createCampaign(knex, {
      name: campaign.name,
      creator: campaign.creator,
      location: campaign.location,
      category_id: categoryId[0]
    })
  });

  return Promise.all(campaignPromises);
};

const createCampaign = (knex, campaign) => {
  return knex('campaigns').insert(campaign);
};

exports.seed = async (knex) => {
  try {
    await knex('campaigns').del();
    await knex('categories').del();

    let categoryPromises = simplifiedData.map(category => {
      return createCategory(knex, category);
    });

    return Promise.all(categoryPromises);
  } catch (error) {
    console.log(`Error seeding data: ${error}`)
  }
};
