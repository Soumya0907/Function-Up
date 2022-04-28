const AuthorModel = require("../module/authorModel")

//............................................1ST API (POST/Create Author)...........................................................


const createAuthor = async (req, res) => {
    try {
        
        const validateEmail = (email) => {
            return String(email)
              .toLowerCase()
              .match(
                /^(^<>([()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              );
          };  


          const validatePassword = (password) => {
            return String(password)
              .match(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
              );
          }; 
        const data = req.body

        if(Object.keys(data).length==0){
            return res.send({msg:"author details not given"})//details is given or not
        }

        if (!data.fname) 
            return res.status(400).send("first name is missing")
        if (!data.lname) 
            return res.status(400).send("last name is missing")
        if (!data.email) 
            return res.status(400).send("email is missing")
        if (!data.password) 
            return res.status(400).send("password is missing")



        if(!validateEmail(data.email)){
                return res.status(400).send({status:false,msg:"Invaild E-mail id "})//email validation
            }
        
        if(!validatePassword(data.password)){
                return res.status(400).send({status:false,msg:"password should contain atleast one number,one special character and one capital letter"})//password validation
            }//password validation

        const email = await AuthorModel.findOne({ email: data.email })//email exist or not
        if (!email){
             const author = await AuthorModel.create(data)
             return res.status(201).send({ msg: author })
        }
        res.status(404).send({ msg: "email already exist" })
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
}

    

module.exports = {createAuthor}


