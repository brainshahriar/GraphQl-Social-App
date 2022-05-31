import crudModel from "../model/crud.js";
import fs from 'fs'

class crudController{
    static post = async (req,res)=>{
        const newPost = new crudModel({
            ...req.body,
            image:req.file.filename
        })
        try {
             await newPost.save()
            return res.send({"status":"Data Inserted"})
        } catch (error) {
            console.log(error);
            return  res.send({"status":"Server side error"})
        }
    }

    static get = async(req,res)=>{
        try {
           crudModel.find({}) 
           .exec((err,data)=>{
               if(err)
               {
                return res.send({"status":"Not found"})
               }
               else{
                res.status(200).json({
                    result:data,
                    message:"success"
                })
               }
           })
        } catch (error) {
            console.log(error);
            return res.send({"status":"Something error"})
        }
    }

    static getByid = async(req,res)=>{
        try {
            const id = req.params.id
            const test = await crudModel.findOne({_id:id})
            .exec()
           if(test){
            return res.send({"Data": test})
           }
           else{
            return res.send({"Data": "Not found"})
           }
        } catch (error) {
            console.log(error);
            return res.send({"status":"Something error"})
        }
    }

    static update = async(req,res)=>{
        let newUser=req.body
        try {
            if(req.file && req.file.filename){
                const img = await crudModel.findById(req.params.id)
                fs.unlink('./uploads/'+img.image,(err)=>{
                    if(err){
                        console.log(err);
                    }
                })
                newUser = {
                    ...newUser,
                    image:req.file.filename
                }
            
            }
            const crud = await crudModel.findByIdAndUpdate(req.params.id,(newUser));
            return res.send({"status":"Updated"})
        } catch (error) {
           console.log(error); 
           return res.send({"status":"Error"})
        }
            

       

    }

    static delete = async (req,res)=>{
        try {
            const img = await crudModel.findById(req.params.id)
            fs.unlink('./uploads/'+img.image,(err)=>{
                if(err){
                    console.log(err);
                }
            })
           await crudModel.findByIdAndDelete(req.params.id)
            return res.send({"status":"Deleted"})

        } catch (error) {
            return res.send({"status":"Error"})
        }
    }

}

export default crudController