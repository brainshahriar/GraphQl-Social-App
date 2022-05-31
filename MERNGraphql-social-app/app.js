import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors';
import connectDB from './config/connectdb.js'
import bodyParser from 'body-parser'
import {graphqlHTTP} from 'express-graphql'
import { ApolloServer, gql } from 'apollo-server-express';
import { typeDefs } from './controller/typeDefs.js';
import { resolvers } from './controller/resolvers.js';

const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// CORS Policy
app.use(cors())
app.use(bodyParser.json())

// app.use('/public',express.static('./uploads'));

// Database Connection
connectDB(DATABASE_URL)

// JSON
// app.use(express.json())
// app.use(formData.parse());

// Load Routes
// app.use("/api/user", userRoutes)

// app.use('/graphql',
// graphqlHTTP({
//     typeDefs,resolvers,
//     graphiql:true
// }))

const startServer = async () =>{
  const apolloServer = new ApolloServer({
    typeDefs,resolvers,
    context:({req})=>({req})
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({app:app});
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
  })
}

startServer();

