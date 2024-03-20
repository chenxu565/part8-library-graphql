import { useState } from 'react';

import { useMutation } from '@apollo/client';
import { EDIT_AUTHOR, GET_ALL_AUTHORS } from '../queries';

const BirthYearEditor = () => {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: GET_ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    editAuthor({ variables: { name, setBornTo: parseInt(born) } });

    setName('');
    setBorn('');
  };

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name
          <input 
            value={name}
            onChange={({ target }) => setName(target.value)}
            placeholder="Author name"
          />
        </div>
        <div>
          born
          <input 
            value={born}
            onChange={({ target }) => setBorn(target.value)}
            placeholder="Year of birth"
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
}

export default BirthYearEditor;