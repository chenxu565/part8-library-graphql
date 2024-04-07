import { gql } from "@apollo/client";

const AUTHOR_DETAILS = gql`
  fragment AuthorDetails on Author {
    id
    name
    born
    bookCount
  }
`;

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    published
    genres
  }
`;

export const GET_ALL_AUTHORS = gql`
  query getAuthors {
    allAuthors {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`;

export const GET_ALL_GENRES = gql`
  query getGenres {
    allGenres
  }
`;

export const GET_ME = gql`
  query getMe {
    me {
      id
      username
      favoriteGenre
    }
  }
`;

export const GET_ALL_BOOKS = gql`
  query getBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      ...BookDetails
      author {
        ...AuthorDetails
      }
    }
  }
  ${AUTHOR_DETAILS}
  ${BOOK_DETAILS}
`;

export const ADD_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      ...BookDetails
      author {
        ...AuthorDetails
      }
    }
  }
  ${AUTHOR_DETAILS}
  ${BOOK_DETAILS}
`;

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
      author {
        ...AuthorDetails
      }
    }
  }
  ${BOOK_DETAILS}
  ${AUTHOR_DETAILS}
`;
