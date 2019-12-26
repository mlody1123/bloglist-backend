const bcrypt = require('bcryptjs')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/', async (req, res, next) => {
  if (!req.body.password || req.body.password.length < 3) {
    res
      .status(400)
      .json({ error: 'Password must be at least 3 characters long' })
  } else {
    try {
      const body = req.body
      const saltRounds = 10

      const passwordHash = await bcrypt.hash(body.password, saltRounds)

      const user = new User({
        username: body.username,
        name: body.name,
        passwordHash
      })

      const savedUser = await user.save()
      res.json(savedUser.toJSON())
    } catch (error) {
      next(error)
    }
  }
})

userRouter.get('/', async (req, res) => {
  const result = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
    id: 1
  })
  res.json(result.map(u => u.toJSON()))
})

module.exports = userRouter
