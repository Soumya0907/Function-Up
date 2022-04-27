const express = require('express');
const router = express.Router();
//const mongoose = require('mongoose')

const authorController = require("../controller/authorController")
const blogController = require("../controller/blogController")


router.post("/authors",authorController.createAuthor)

router.post("/blogs",blogController.createBlogs)

router.get("/getBlogs",blogController.getBlogs)

router.get("/getFilterBlogs",blogController.getFilterBlogs)

router.put("/blogs/:blogId",blogController.updateBlog)

router.delete("/blogs/:blogId",blogController.deleteBlog)

router.delete("/deleteQuery",blogController.deleteParams)
module.exports = router;