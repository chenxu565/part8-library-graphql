import { gql } from '@apollo/client';

export const GET_ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

export const GET_ALL_BOOKS = gql`
  query 
    getBooks(
      $author: String,
      $genre: String
    ) {
      allBooks(
        author: $author,
        genre: $genre,
      ) {
        title
        published
        genres
        author {
          bookCount
          born
          id
          name
        }
      }
  }`

export const ADD_BOOK = gql`
  mutation 
    createBook(
      $title: String!,
      $author: String!,
      $published: Int!,
      $genres: [String!]!
    ) {
      addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
      ) {
        title
        published
        genres
        author {
          bookCount
          name
          id
        }
      }
    }
  `

export const EDIT_AUTHOR = gql`
  mutation 
    editAuthor(
      $name: String!,
      $setBornTo: Int!
    ) {
      editAuthor(
        name: $name,
        setBornTo: $setBornTo
      ) {
        name
        born
      }
    }
  `

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`