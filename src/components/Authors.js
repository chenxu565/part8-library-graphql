import { useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { GET_ALL_AUTHORS } from '../queries';
import BirthYearEditor from './BirthYearForm';

const Authors = (props) => {
  const result = useQuery(GET_ALL_AUTHORS, 
    {
      skip: !props.show,
      fetchPolicy: 'cache-and-network'
    });
    
  const [ authors, setAuthors ] = useState([]);

  useEffect(()=>{
    if(result.data){
      setAuthors(result.data.allAuthors);
    }
  }, [result.data])

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!props.show) {
    return null
  }
  
  // const authors = result.data.allAuthors;

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {
        props.token ?
        <BirthYearEditor authors={authors}/> :
        null
      }
    </div>
  )
}

export default Authors
