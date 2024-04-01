import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { GET_ALL_BOOKS, GET_ALL_GENRES } from '../queries';

const Books = (props) => {
  const [genreTab, setGenreTab ] = useState("all genres")
  const booksResult = useQuery(GET_ALL_BOOKS, 
    {
      skip: !props.show,
      fetchPolicy: "cache-and-network",
      variables: {
        genre: genreTab==="all genres"? null: genreTab
      }
    });

  const genresResult = useQuery(GET_ALL_GENRES, 
    {
      skip: !props.show,
      fetchPolicy: "cache-and-network"
    }
  )

  if (booksResult.loading) {
    return <div>loading...</div>;
  }
  
  if (!props.show) {
    return null
  }
  const books = booksResult.data?.allBooks || [];
  const uniqueGenres = genresResult.data?.allGenres || [];
  const buttonGenres = [...uniqueGenres, 'all genres']

  const toggleGenre = (genre) => {
    setGenreTab(genre);
    booksResult.refetch(
      {
        genre: genre==="all genres"? null: genre
      }
    )
  }

  return (
    <div>
      <h2>Books</h2>
      {
        buttonGenres.map(
          (genre) =>
          (
            <button 
              key={genre}
              onClick={()=>toggleGenre(genre)}
            >
              {genre}
            </button>
          )
        )
      }
      {genreTab==="all genres"? <p><b>All genres</b></p> : <p>in genre <b>{genreTab}</b></p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
