// const papersData = require('../../../papersData');
import { data } from '../../../data';

const createPaper = async (knex, paper) => {
  const paperId = await knex('papers').insert({
    title: paper.title,
    author: paper.author
  }, 'id');

  let footnotePromises = paper.footnotes.map(footnote => {
    return createFootnote(knex, {
      note: footnote,
      paper_id: paperId[0]
    })
  });

  return Promise.all(footnotePromises);
};

const createFootnote = (knex, footnote) => {
  return knex('footnotes').insert(footnote);
};

exports.seed = async (knex) => {
  try {
    await knex('footnotes').del() // delete footnotes first
    await knex('papers').del() // delete all papers

    let paperPromises = papersData.map(paper => {
      return createPaper(knex, paper);
    });

    return Promise.all(paperPromises);
  } catch (error) {
    console.log(`Error seeding data: ${error}`)
  }
};
