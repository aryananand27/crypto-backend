const express=require('express');
const cors=require('cors');
const app=express(); 
require('./DB/config');
require('dotenv').config();
const UserModel=require('./Models/User');
const alertModel=require('./Models/Alert')
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const secretkey=process.env.JWT_SECRET_KEY;


app.use(cors());
app.use(express.json());

app.get('/',(req,resp)=>{
    resp.send('connection set up');
})


app.post('/register',async(req,resp)=>{
    try{
        if(req.body.username && req.body.email && req.body.password){
            const result=new UserModel(req.body);
            const token=  jwt.sign({_id:result._id},secretkey,{expiresIn:"1h"});
            const data=await result.save();
            delete data.password;
            resp.send({result:data,token});
        }
        else{
            resp.send({err:"All Field is required.."});
        } 
   }
   catch(error){
    if(error.keyPattern){
        resp.send({err:"User Already Exists."})
    }
    else{
        resp.send(error);
    }
   }
})

app.post('/login',async(req,resp)=>{
    if(req.body.username && req.body.password){
        const result= await UserModel.findOne({username:req.body.username});
        
        if(result){
            const ismatch=await bcrypt.compare(req.body.password,result.password);
            const token=jwt.sign({_id:result._id},secretkey,{expiresIn:"1h"});
            if(ismatch){
                delete result.password;
                resp.send({result,token});
            }
            else{
                resp.send({err:"User Credential is wrong."})
            }
        }
        else{
            resp.send({err:"Username is not found."})
        }
        
    }
    else{
        resp.send({err:"All Field is required."})
    }
})

app.put('/alert/:id',async(req,resp)=>{


    let data=await alertModel.findOne({userId:req.params.id});
     
    if(data){

       let remarray=[];
      data.alert.forEach(element => {
            let obj={coin:element.coin,price:element.price}
            remarray.push(obj);
      });
        
        let arrnew=req.body.alert;
        arrnew=arrnew.concat(remarray);
        let sndarray=arrnew.filter(function(key,index){
                return index===arrnew.findIndex(function(obj){
                    return JSON.stringify(key)===JSON.stringify(obj);
                })
            })
           
        req.body.alert=sndarray;
      
         const result=await alertModel.updateOne({userId:req.params.id},{$set:req.body});
        resp.send(result);
    }
    else{
        let result=new alertModel(req.body);
        let data=await result.save();
        resp.send(data);
    }
})
app.get('/getalert/:id',async(req,resp)=>{
    if(req.params.id){
        let result=await alertModel.findOne({userId:req.params.id});
        if(result){
            resp.send(result);
        }
        else{
            resp.send({err:"Nothing available"});
        }
    }
    else{
        resp.send({err:"Not an Authorized User."})
    }
})

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
    next(); 
})

app.listen(7000);