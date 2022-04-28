const BlogModel = require('../module/blogModel.js')
const AuthorModel = require("../module/authorModel.js")
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const createBlogs = async function (req, res) {   //create the Blog
    try {
        const validateTitle = (title) => {
            return String(title)
                .match(
                    /^[a-zA-Z]/
                );
        };
        
        const data = req.body
        if (Object.keys(data).length == 0) {
            return res.send({ msg: "Blog details not given" })//details is given or not
        }
        if (!data.title) {
            return res.status(400).send({ msg: "title not given" })
        }
        if (!validateTitle(data.title)) {
            return res.status(400).send({ status: false, msg: "Invaild title" })//title validation
        }


        if (!data.body)
            return res.status(400).send({ msg: "body not given" })
        if (!data.authorId)
            return res.status(400).send({ msg: "authorId not given" })
        if (!data.category)
            return res.status(400).send({ msg: "category not given" })

        let isValidauthorID = mongoose.Types.ObjectId.isValid(data.authorId);
        if (!isValidauthorID) {
            return res.status(400).send({ status: false, msg: "Author Id is Not Valid" });
        }

        const id = await AuthorModel.findById(data.authorId)
        if (!id)
            return res.status(404).send({ msg: "authorId not found" })

        const reEntry = await BlogModel.findOne({ title: data.title, authorId: data.authorId })
        if (reEntry) {
            return res.status(400).send({ msg: `you have a blog of title ${data.title}` })
        }
        const blog = await BlogModel.create(data)
        return res.status(201).send({ msg: blog })
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }

}


const getBlogs = async function (req, res) {  //get blog using filter query params
    try {
        const authorId = req.query.authorId;
        const category = req.query.category;
        const tags = req.query.tags;
        const subcategory = req.query.subcategory;
        const obj = {
            isDeleted: false,
            isPublished: true,

        };
        if (category)
            obj.category = category;
        if (authorId)
            obj.authorId = authorId;
        if (tags)
            obj.tags = tags;
        if (subcategory)
            obj.subcategory = subcategory;

        if (obj.authorId) {
            let isValidauthorID = mongoose.Types.ObjectId.isValid(obj.authorId);//check if objectId is objectid
            if (!isValidauthorID) {
                return res.status(400).send({ status: false, msg: "Author Id is Not Valid" });
            }

            const id = await AuthorModel.findById(obj.authorId)//check id exist in author model
            if (!id)
                return res.status(404).send({ msg: "authorId dont exist" })
        }

        const data = await BlogModel.find(obj);
        if (data.length == 0) {
            return res.status(404).send({ status: false, msg: "Blogs not found" });
        }
        res.status(200).send({ status: true, data: data });
    } catch (err) {
        res.status(500).send({ status: true, msg: err.message });
    }
};

const updateBlog = async (req, res) => { //update blog
    try {
        const blogId = req.params.blogId
        // let data = req.body


        // // let isValidblogID = mongoose.Types.ObjectId.isValid(blogId);
        // // if (!isValidblogID) {
        // //     return res.status(400).send({ status: false, msg: "Blog Id is Not Valid" });
        // }
        const blog = await BlogModel.findOne({ _id: blogId, isDeleted: false }) //blog will contain only 1 doc
        //beacuse blog id is unique

        if (!blog)
            return res.status(404).send({ msg: "no records found!!!" })

        if (blog.isPublished == true) {
            return res.status(404).send({ msg: "blog already published" })
        }

        if (req.body.title) {
            blog.title = req.body.title
        }
        if (req.body.body) {
            blog.body = req.body.body
        }
        if (req.body.tags) {
            let temp1 = blog.tags
            temp1.push(req.body.tags) //adding tags 
            blog.tags = temp1
        }
        if (req.body.subcategory) {
            let temp2 = blog.subcategory
            temp2.push(req.body.subcategory)//adding subcategory
            blog.subcategory = temp2
        }

        blog.publishedAt = new Date()
        blog.isPublished = true
        blog.save()
        console.log(blog)
        res.status(200).send({ msg: blog })

    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
}

const deleteBlog = async (req, res) => {
    try {
        // const id = req.params.blogId
        // if (!id)
        //     return res.status(404).send({ msg: "give the blogId " })

        // let isValidblogID = mongoose.Types.ObjectId.isValid(id);
        // if (!isValidblogID) {
        //     return res.status(400).send({ status: false, msg: "Blog Id is Not Valid" });
        // }

        // const blog = await BlogModel.findById(id)
        // if (blog.length==0)
        //     return res.status(404).send({ msg: "blogId dont exist" })

        if (blog.isDeleted == false) {
            blog.isDeleted = true
            blog.deletedAt = new Date()
            blog.save()
            return res.status(200).send({ msg: blog })
        }

        return res.status(404).send({ msg: "dont exist deleted" })
    }

    catch (err) {
        res.status(500).send({ error: err.message })
    }


}

const deleteParams = async (req, res) => {
    try {

        let token = req.headers['x-Auth-Key'] || req.headers['x-auth-key']
        if (!token) {
            return res.status(404).send({ status: false, msg: "token must be present" });
        }

        let decodedtoken = jwt.verify(token, "group11")
        if (!decodedtoken) {
            return res.status(401).send({ status: false, msg: "token is invalid" });
        }

        const obj = {}     //obj is condition for find

        if (req.query.authorId) {
            if (req.query.authorId != decodedtoken.authorId) {
                return res.send({ msg: "unauthorized access" })
            }
            obj.authorId = req.query.authorId
        }
        if (req.query.category) {
            obj.category = req.query.category
        }
        if (req.query.tags) {
            obj.tags = req.query.tags
        }
        if (req.query.subcategory) {
            obj.subcategory = req.query.subcategory
        }
        obj.isPublished = false //unpublished
        obj.isDeleted = false //not deleted
        obj.authorId = decodedtoken.authorId
        console.log(obj)

        const data = await BlogModel.updateMany(obj, { $set: { isDeleted: true, deletedAt: new Date() } })

        if (data.matchedCount == 0)
            return res.status(404).send({ status: false, msg: "blog not found" })


        res.status(200).send({ status: true, data: "finally deleted Successfull " + data.matchedCount + " documents" })

    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
}

module.exports = { createBlogs, getBlogs, updateBlog, deleteBlog, deleteParams }

// const deleteBlogs = async (req, res) => {

//     try {
//         req.query.isDeleted =false;
//         console.log(req.query)
//         let date = new Date()
//         const data = await BlogModel.updateMany(req.query, { $set: { isDeleted: true ,deletedAt:date} })

//         if(data.matchedCount==0)
//         return res.status(404).send({ status: false, msg: "blog not found" })


//         res.status(200).send({ status: true,data:"finally deleted Successfull " +data.matchedCount+" documents" })
//     }
//     catch (err) {
//         res.send({ msg: err.message })
//     }


// }


// const getBlogs = async (req, res) => {
//     try {
//         const blog = await BlogModel.find({ isDeleted: false, isPublished: true })
//         if (Object.keys(blog) != 0)
//             return res.status(200).send({ msg: blog })

//         return res.status(400).send({ msg: "nothing found" })
//     }
//     catch (err) {
//         res.status(500).send({ error: err.message })
//     }
// }
// const getFilterBlogs = async (req, res) => {
//     try {

//         const obj = {}
//         obj.authorId = req.query.authorId
//         obj.category = req.query.category
//         obj.tags = req.query.tags
//         obj.subcategory = req.query.subcategory
//         obj.isDeleted = false     //deleted doc should not come
//         console.log(obj)

//         Object.keys(obj).forEach(key => {
//             if (obj[key] == undefined) {
//                 delete obj[key]
//             }
//         })

//         if (obj.authorId) {
//             const id = await AuthorModel.findById(obj.authorId)
//             if (!id)
//                 return res.status(404).send({ msg: "authorId is invalid" })
//         }

//         const filterBlog = await BlogModel.find(obj)
//         console.log(obj)
//         return res.send({ msg: filterBlog })
//     }
//     catch (err) {
//         res.status(500).send({ error: err.message })
//     }
// }

        // Object.keys(obj).forEach(key => {  //undefined value remove
        //     if (obj[key] == undefined) {
        //         delete obj[key]
        //     }
        // })

        // if (obj.authorId != undefined) {


        //     let isValidauthorID = mongoose.Types.ObjectId.isValid(obj.authorId);
        //     if (!isValidauthorID) {
        //         return res.status(400).send({ status: false, msg: "Author Id is Not Valid" });
        //     }

        //     if (obj.authorId) {
        //         const id = await AuthorModel.findById(req.query.authorId)
        //         if (!id)
        //             return res.status(404).send({ msg: "authorId dont exist" })
        //     }
        // }

        // const blog = await BlogModel.find(obj)
        // if (Object.keys(blog) == 0) {
        //     return res.status(404).send({ msg: "no records exist" })
        // }
        // for (let i = 0; i < blog.length; i++) {
        //     blog[i].isDeleted = true
        //     blog[i].deletedAt = new Date()
        //     blog[i].save()
