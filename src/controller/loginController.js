//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PHASE -2 API Login >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const jwt = require('jsonwebtoken');
const AuthorModel = require('../module/authorModel.js');

const userlogin= async function(req,res){
    try{

        const email=req.body.email;
        const password=req.body.password;

        if(Object.keys(req.body).length==0)
            return res.status(400).send({status:false,msg:"Field Can't Empty.Please Enter Some Details"})//details is given or not

         if(!(email)){
            return res.status(400).send({status:false,msg:"Please Fill Email Feild"})}

        if(!(password)){
            return res.status(400).send({status:false,msg:"Please Fill Password Feild "})}

        if(!validateEmail(email)){
            return res.status(400).send({status:false,msg:"Incorrect Email Format "})//email validation
            }

        if(!validatePassword(password)){
            return res.status(400).send({status:false,msg:"Incorrect Password Format"})//password validation
            }//password validation

        const value=await AuthorModel.findOne({
            email:email,
            password:password,
    });
        if(!value)
        return res.status(400).send( {msg : "Email and Password not Matched"});
        let token=jwt.sign(
            {author_Id:value._id.toString()},
            "My Secret Key"
            );
    res.setHeader("x-api-key",token);
    res.status(202).send({status:true,data:token});
        }
        catch(error){
            res.status(500).send({msg:"Error",error:error.message})
        }
    }

    module.exports.userlogin=userlogin