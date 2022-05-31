import postModel from '../model/Post.js'
import User from '../model/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserInputError } from 'apollo-server-express';
import {validateRegisterInput,validateLoginInput} from '../utils/validator.js'
import checkAuth from '../utils/check-auth.js'

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1h' }
  );
}


export const resolvers = {
  Query: {
    getPost: async () => {
      try {
        return await postModel.find().sort({createdAt : -1});
      } catch (error) {
        throw new Error(err)
      }
    
    },
    async getPosts(_,{postId}){
      try {
        const post = await postModel.findById(postId);
        if(post){
          return post;
        }
        else{
          throw new Error('post not found')
        }
      } catch (error) {
        throw new Error(error)
      }
    }
  },



  Mutation: {
    async register(
      _,
      {
        registerInput: { username, email, password, confirmPassword }
      }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken'
          }
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token
      };
    },


    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong crendetials';
        throw new UserInputError('Wrong crendetials', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token
      };
    },

    async createPost(_,{body},context){
      const user = checkAuth(context);
      const newPost =  new postModel({
        body,
        user:user.id,
        username:user.username,
        createdAt:new Date().toISOString()
      });
      const post = await newPost.save();
      return post;
    },

    async deletePost(_,{postId},context){
      const user = checkAuth(context)
      try {
        const post = await postModel.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return 'Post deleted successfully';
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } catch (error) {
        throw new Error(error);
      }
    },


    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not empty'
          }
        });
      }

      const post = await postModel.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString()
        });
        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context);

      const post = await postModel.findById(postId);

      if (post) {
          post.comments = post.comments.filter(comment=>{
            if(comment.id===commentId && comment.username === username) 
            return false;
            return true;
          });
          await post.save();
          return post;
        } else {
          throw new AuthenticationError('Action not allowed');
        }
    }
  },
};
