const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')

const fewUsers = [
  {
    name: 'Andrzej',
    username: 'Andrzej Jeden',
    passwordHash: '123456'
  },
  {
    name: 'Michal',
    username: 'Michal Jeden',
    passwordHash: '123456'
  }
]

beforeEach(async () => {
  await User.deleteMany({})

  let userObject = new User(fewUsers[0])
  await userObject.save()

  userObject = new User(fewUsers[1])
  await userObject.save()
})

describe('user api', () => {
  test('addition new user with return status 200 OK', async () => {
    const newUser = {
      name: 'Janusz',
      username: 'Janusz1',
      password: '123456'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const usersAtEnd = await User.find({})

    expect(usersAtEnd.length).toBe(fewUsers.length + 1)
  })
  test('addition new user with empty username return status 400', async () => {
    const newUser = {
      name: 'Janusz',
      password: '123456'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })
  test('addition new user with min length of password 3 return status 400', async () => {
    const newUser = {
      name: 'Janusz',
      username: 'Janusz1',
      password: '12'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain(
      'Password must be at least 3 characters long'
    )

    const usersAtEnd = await User.find({})
    expect(usersAtEnd.length).toBe(fewUsers.length)
  })
  test('addition new user with existing username return status 400', async () => {
    const newUser = {
      name: 'Janusz',
      username: 'Andrzej Jeden',
      password: '123456'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const userAtEnd = await User.find({})
    expect(userAtEnd.length).toBe(fewUsers.length)
  })
})
afterAll(() => {
  mongoose.connection.close()
})
