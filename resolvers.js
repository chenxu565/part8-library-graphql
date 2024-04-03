const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    me: (root, args, context) => {
      return context.currentUser;
    },
    allAuthors: async () => Author.find({}),
    allGenres: async () => {
      const books = await Book.find({});
      return [...new Set(books.flatMap((book) => book.genres))];
    },
    allBooks: async (root, args) => {
      if (!args.author) {
        if (!args.genre) {
          return Book.find({}).populate("author");
        } else {
          return Book.find({ genres: args.genre }).populate("author");
        }
      } else {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          if (!args.genre) {
            return Book.find({ author: author._id }).populate("author");
          } else {
            return Book.find({
              author: author._id,
              genres: args.genre,
            }).populate("author");
          }
        } else {
          return [];
        }
      }
    },
  },
  Author: {
    bookCount: async (root) => root.books.length,
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const book = new Book({ ...args });
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({
          name: args.author,
        });
        try {
          await author.save();
        } catch (error) {
          if (error.name === "ValidationError") {
            throw new GraphQLError("Validation Error: " + error.message, {
              extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: { field: "author", value: args.author },
              },
            });
          } else {
            throw new GraphQLError("Saving author failed", {
              extensions: {
                code: "INTERNAL_SERVER_ERROR",
                error: "An unexpected error occurred",
              },
            });
          }
        }
      }
      book.author = author._id;
      let createdBook;
      try {
        createdBook = await book.save();
        createdBook = await createdBook.populate("author");
      } catch (error) {
        if (error.name === "ValidationError") {
          throw new GraphQLError("Validation Error: " + error.message, {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: { field: "title", value: args.title },
            },
          });
        } else {
          throw new GraphQLError("Saving book failed", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              error: "An unexpected error occurred",
            },
          });
        }
      }
      try {
        author.books = author.books.concat(createdBook);
        await author.save();
      } catch (error) {
        if (error.name === "ValidationError") {
          throw new GraphQLError("Validation Error: " + error.message);
        } else {
          throw new GraphQLError("Saving author with new book failed", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              error: "An unexpected error occurred",
            },
          });
        }
      }
      return createdBook;
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const authorFound = await Author.findOne({ name: args.name });
      if (!authorFound) {
        console.log("Author not found");
        throw new GraphQLError("Author not found", {
          extensions: {
            code: "NOT_FOUND",
            message: `No author found with the name ${args.name}`,
          },
        });
      }
      try {
        const updatedAuthor = await Author.findOneAndUpdate(
          { name: args.name },
          { born: args.setBornTo },
          { new: true },
        );
        return updatedAuthor;
      } catch (error) {
        if (error.name === "ValidationError") {
          throw new GraphQLError("Validation Error: " + error.message, {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          });
        } else {
          throw new GraphQLError("Error updating author", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              message: "An unexpected error occurred during author update",
            },
          });
        }
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

module.exports = resolvers;
