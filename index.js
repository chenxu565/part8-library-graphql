const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = `
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    bookCount: Int!
    born: Int
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => Author.find({}),
    allBooks: async (root, args) => {
      if (!args.author) {
        if (!args.genre) {
          return Book.find({}).populate('author')
        }
        else {
          return Book.find({ genres: args.genre}).populate('author')
        }
      }
      else {
        const author = await Author.findOne({name: args.author})
        if (author) {
          if (!args.genre) {
            return Book.find({author: author._id}).populate('author')
          }
          else {
            return Book.find(
              { 
                author: author._id,
                genres: args.genre
              }
            ).populate('author')
          }
        }
        else {
          return []
        }
      }
    }
  },
  Author: {
    bookCount: async (root) => {
      const author = await Author.findOne({name: root.name})
      if (!author) {
        return 0
      }
      const books = await Book.find({ author: author._id })
      return books.length
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const book = new Book({ ...args })
      let author = await Author.findOne({name: args.author})
      if (! author) {
        author = new Author({
          name: args.author,
        })
        try {
          await author.save()
        } catch (error) {
          if (error.name === 'ValidationError') {
            throw new GraphQLError('Validation Error: ' + error.message, {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: {field: 'author', value: args.author},
              }
            })
          } else {
            throw new GraphQLError('Saving author failed', {
              extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                error: 'An unexpected error occurred'
              }
            })
          }
        }
      }
      book.author = author._id
      try {
        let createdBook = await book.save()
        createdBook = await Book.findById(createdBook._id).populate('author')
        return createdBook        
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError('Validation Error: ' + error.message, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: {field: 'title', value: args.title},
            }
          })
        } else {
          throw new GraphQLError('Saving book failed', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              error: 'An unexpected error occurred'
            }
          })
        }
      }
    },
    editAuthor: async (root, args) => {
      const authorFound = await Author.findOne({name: args.name})
      if (!authorFound) {
        console.log('Author not found')
        throw new GraphQLError('Author not found', {
          extensions: {
            code: 'NOT_FOUND',
            message: `No author found with the name ${args.name}`
          }
        })
      }
      try {
        const updatedAuthor = await Author.findOneAndUpdate(
          { name: args.name },
          { born: args.setBornTo },
          { new: true }
        )
        return updatedAuthor        
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError('Validation Error: ' + error.message, {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })
        } else {
          throw new GraphQLError('Error updating author', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'An unexpected error occurred during author update'
            }
          })
        }
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})