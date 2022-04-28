const jwt = require("jsonwebtoken");
const BlogModel = require('../module/blogModel')
const AuthorModel = require("../module/authorModel")

const mongoose=require('mongoose')

const authentication = async function (req, res, next) {
    try
    {
    let token = req.headers['x-Auth-Key'] || req.headers['x-auth-key']
    if (!token) {
        return res.status(404).send({ status: false, msg: "token must be present" });
    }
  
        let decodedtoken = jwt.verify(token, "group11")
        if (!decodedtoken) {
            return res.status(401).send({ status: false, msg: "token is invalid" });
        }
        next();
    }
    catch (err) {
            res.status(500).send({ msg: Error, error: err.message })

        }
}

const authorization = async function (req, res, next) {

    try
    {
    let token = req.headers['x-Auth-Key'] || req.headers['x-auth-key']//token has jwt token

    const id = req.params.blogId //blogId is coming from path paramter
    if (!id)
        return res.status(404).send({ msg: "give the blogId " })

    let isValidblogID = mongoose.Types.ObjectId.isValid(id);
    if (!isValidblogID) {
        return res.status(400).send({ status: false, msg: "Blog Id is Not Valid" });
    }

    const blog = await BlogModel.findById(id)
    if (blog.length==0)
        return res.status(404).send({ msg: "blogId dont exist" })

    
    const decodedtoken = jwt.verify(token, "group11")
    if (!decodedtoken)
        return res.status(401).send({ status: false, msg: "token is invalid" });
    
   
    if (blog.author != decodedtoken.authorId)//match token authorId with blogdocument AuthorId
        return res.status(403).send({ status: false, msg: "cannot access" });
     
    next() //if match then move the execution to next

    }
    catch(err){
        res.status(500).send({ msg: Error, error: err.message })
    }

}

module.exports = { authentication, authorization }