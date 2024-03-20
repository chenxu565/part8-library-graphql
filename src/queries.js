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
  query {
    allBooks {
      title
      author
      published
      genres
    }
  }`