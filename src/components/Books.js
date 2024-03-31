import { useQuery } from '@apollo/client';

import { GET_ALL_BOOKS } from '../queries';

const Books = (props) => {
  const result = useQuery(GET_ALL_BOOKS);

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!props.show) {
    return null
  }

  const books = result.data.allBooks;

  return (
    <div>
      <h2>Books</h2>

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
