import { useState } from "react";

import { useMutation } from "@apollo/client";
import { EDIT_AUTHOR } from "../queries";
import { updateEditedAuthorBirthYearCache } from "../App";

const BirthYearEditor = ({ authors }) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onCompleted: () => {
      setName("");
      setBorn("");
    },
    update: (cache, response) => {
      updateEditedAuthorBirthYearCache(cache, response.data.editAuthor);
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    editAuthor({ variables: { name, setBornTo: parseInt(born) } });
  };

  return (
    <div>
      <h2>Set birthyear</h2>
      <form id="birthYearForms" onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            <option value="">Select author</option>
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
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
};

export default BirthYearEditor;
