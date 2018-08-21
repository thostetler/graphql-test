import { GraphQLServer } from 'graphql-yoga';
import resolvers from './resolvers';

const server = new GraphQLServer({
  typeDefs: './schema.graphql', resolvers
});

server.start({
  port: 8000
}, ({ port }) => console.log(`Server is running on localhost:${port}`))
