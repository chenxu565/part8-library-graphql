import { useQuery } from "@apollo/client";

import { GET_ALL_AUTHORS } from "../queries";
import BirthYearEditor from "./BirthYearForm";

const Authors = (props) => {
  const result = useQuery(GET_ALL_AUTHORS, {
    skip: !props.show,
    fetchPolicy: "cache-and-network",
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const authors = result.data.allAuthors;

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
      {props.token ? <BirthYearEditor authors={authors} /> : null}
    </div>
  );
};

export default Authors;
