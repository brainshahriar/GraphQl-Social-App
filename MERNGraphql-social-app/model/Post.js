import mongoose from "mongoose";
import Schema from 'mongoose'

const postSchema = new mongoose.Schema({
        body: { type: String, trim: true },
        username: { type: String, trim: true },
        createdAt: String,
        comments:[
            {
                body:String,
                username:String,
                createdAt:String
            }
        ],
        likes:[
            {
                username:String,
                createdAt:String
            }
        ], 
        user:{
            type:Schema.Types.ObjectId,
            ref:'user'
        }
})

const postModel = mongoose.model("post",postSchema)

export default postModel