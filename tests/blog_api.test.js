const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

const listWithFewBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url:
      'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  }
]
beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(listWithFewBlogs[0])
  await blogObject.save()

  blogObject = new Blog(listWithFewBlogs[1])
  await blogObject.save()
})

describe('when there is initially some blogs saved', () => {
  test('total amout of blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(listWithFewBlogs.length)
  })
})

describe('addition to a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Test Test Test',
      author: 'Michael  Chan',
      url: 'http://test.com',
      likes: 2
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnds = await api.get('/api/blogs')
    const contents = blogsAtEnds.body.map(e => e.title)
    expect(blogsAtEnds.body.length).toBe(listWithFewBlogs.length + 1)
    expect(contents).toContain(newBlog.title)
  })

  test('with missing property likes set default value of like to 0 ', async () => {
    const newBlogWithoutLikes = {
      title: 'Test Test Test',
      author: 'Michael  Chan',
      url: 'http://test.com'
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnds = await api.get('/api/blogs')
    const likes = blogsAtEnds.body.map(e => e.likes)
    expect(likes).toContain(0)
  })

  test('with missing property title and url return status code 400', async () => {
    const newBlogWithoutTitleAndUrl = {
      author: 'Michael Chan'
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutTitleAndUrl)
      .expect(400)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body.length).toBe(listWithFewBlogs.length)
  })
})
describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogAtStart = await api.get('/api/blogs')
    const blogToDelete = blogAtStart.body[0]

    await api.delete(`/api/blogs/${blogToDelete._id}`).expect(204)
  })
})

describe('update the blog parametrs', () => {
  test('update likes', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updateLikes = {
      likes: 6
    }

    await api
      .put(`/api/blogs/${blogToUpdate._id}`)
      .send(updateLikes)
      .expect(200)

    const blogsAtEnd = await Blog.find({})
    const likes = blogsAtEnd.map(e => e.likes)

    expect(likes).toContain(updateLikes.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
