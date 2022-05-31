import { gql } from "apollo-server-express";
export const typeDefs = gql`

type Post {
    id:ID!,
    username:String!,
    createdAt:String!,
    body:String!
    comments:[Comment]!
    likes:[Like]!
}

type Comment{
    id:ID!
    createdAt:String!
    username:String!
    body:String
}

type Like{
    id:ID!
    createdAt:String!
    username:String!
}

type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

type Query {
  getPost:[Post]
  getPosts(postId:ID!):Post!
}


type Mutation{
    register(registerInput:RegisterInput):User!
    login(username:String!,password:String):User!
    createPost(body:String!):Post!
    deletePost(postId:ID!):Post!

    createComment(postId:String! , body:String!):Post!
    deleteComment(postId:String!,commentId:ID!):Post!

    likePost(postId: ID!): Post!

}
`;
// updatePost(id:String,post:PostInput):Post
// deletePost(id:String):Post
