import fetch from 'node-fetch';
import querystring from 'querystring';
import memoize from 'memoizee';

const DEFAULT_FIELDS = [
  'title', 'abstract', 'comment',
  'bibcode', 'author', 'keyword',
  'id', 'citation_count', '[citations]',
  'pub', 'aff', 'volume', 'pubdate',
  'doi', 'pub_raw', 'page', 'property',
  'esources', 'data', 'email', 'doctype'
];

const DEFAULT_REQUEST_PARAMS = {
  headers: {
    Accept: 'application/json',
    Authorization: 'Bearer:nygCEUOLMpBgsSw5tcWOzg1neANMaxqkfrHRXu59'
  }
};

const baseURL = 'https://devapi.adsabs.harvard.edu';
const getData = async (path, params, options) => {
  const data = await(fetch(
    `${baseURL}/v1${path}?${querystring.stringify(params)}`,
    { ...DEFAULT_REQUEST_PARAMS, options }
  ));
  return await data.json();
}

const paginationProvider = memoize((numFound, perPage, start) => {
  const totalPages = Math.ceil(numFound / perPage);
  const currentPage = Math.trunc(start / perPage);
  const hasNextPage = totalPages !== currentPage;
  const hasPreviousPage = currentPage !== 0;
  return { totalPages, currentPage, hasNextPage, hasPreviousPage };
});

const search = async (parent, args) => {
  const { q, sort, rows, start } = args;
  const params = {
    sort: sort.join(','),
    fl: DEFAULT_FIELDS.join(','),
    q, rows, start
  };

  const data = await getData('/search/query', params);
  const docs = data.response.docs.map((d) => {
    const date = d.pubdate.split('-');
    return {
      ...d,
      citations: {
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
      documentType: d.doctype,
      authors: d.author
    };
  });

  const numFound = data.response.numFound;
  return {
    pageInfo: paginationProvider(numFound, params.rows, params.start),
    numFound,
    docs
  };
};

export default {
  Query: {
    search: search
  }
}
