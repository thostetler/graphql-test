
const { GraphQLServer } = require('graphql-yoga');
const fetch = require('node-fetch');
const querystring = require('querystring');

const baseURL = 'https://devapi.adsabs.harvard.edu';

const resolvers = {
  Query: {
    docs: async (parent, args) => {
      try {
        const { q, sort } = args;
        const params = {
          q: q,
          sort: sort.join(','),
          fl: 'title,abstract,comment,bibcode,author,keyword,id,citation_count,[citations],pub,aff,volume,pubdate,doi,pub_raw,page,property,esources,data,email,doctype',
          rows: 25,
          start: 0
        };
        const data = await fetch(`${baseURL}/v1/search/query?${querystring.stringify(params)}`, {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer:nygCEUOLMpBgsSw5tcWOzg1neANMaxqkfrHRXu59'
          }
        });
        const json = await data.json();
        // return json.response.docs;
        return json && json.response && json.response.docs.map(d => {
          const date = d.pubdate.split('-');
          return Object.assign({}, d, {
            'citations': {
              numReferences: d['[citations]'].num_references,
              numCitations: d['[citations]'].num_citations
            },
            title: d.title.join(' '),
            citationCount: d.citation_count,
            publication: {
              name: d.pub,
              raw: d.pub_raw
            },
            publicationDate: {
              year: date[0] || '00',
              month: date[1] || '00',
              day: date[2] || '00'
            },
            affiliations: d.aff,
            documentType: d.doctype
          });
        });
      } catch (e) {
        return {};
      }
    }
  }
}

const server = new GraphQLServer({ typeDefs: './schema.graphql', resolvers });
server.start({
  port: 8000
}, ({ port }) => console.log(`Server is running on localhost:${port}`))
