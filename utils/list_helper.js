const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  return blogs || blogs.length > 0
    ? blogs.reduce((total, a) => total + a.likes, 0)
    : 0
}

const favoriteBlog = blogs => {
  const favorite = [...blogs].sort((a, b) => b.likes - a.likes)[0]
  const result = {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
  return result
}

const mostBlogs = blogs => {
  const authors = [...new Set(blogs.map(a => a.author))]

  const temp = []
  authors.forEach(author => {
    const blogsNumber = blogs.filter(a => a.author === author).length
    temp.push({
      author: author,
      blogs: blogsNumber
    })
  })

  return [...temp].sort((a, b) => b.blogs - a.blogs)[0]
}

const mostLikes = blogs => {
  const authors = [...new Set(blogs.map(a => a.author))]

  const temp = []
  authors.forEach(author => {
    const authorLikes = blogs
      .filter(blog => blog.author === author)
      .reduce((total, element) => total + element.likes, 0)

    temp.push({
      author: author,
      likes: authorLikes
    })
  })

  return [...temp].sort((a, b) => b.likes - a.likes)[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
