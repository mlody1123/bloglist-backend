const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogRouter.get('/', async (request, response) => {
  const result = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1
  })

  response.json(result.map(b => b.toJSON()))
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body

  try {
    const decodedToken = await jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const userFound = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: userFound._id
    })

    const result = await blog.save()
    userFound.blogs = userFound.blogs.concat(result._id)
    await userFound.save()
    await result
      .populate('user', {
        username: 1,
        name: 1,
        id: 1
      })
      .execPopulate()

    response.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const decodedToken = await jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const result = await Blog.findOneAndDelete({ _id: id, user: user._id })
    user.blogs = user.blogs.filter(blog => blog !== id)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id

  const foundBlog = await Blog.findById(id)

  const likes = foundBlog.likes + 1
  const blog = {
    likes: likes
  }

  const result = await Blog.findByIdAndUpdate(id, blog, { new: true })

  response.json(result.toJSON)
})

module.exports = blogRouter
