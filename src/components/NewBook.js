import { useState } from "react";
import { useMutation } from "@apollo/client";

import { ADD_BOOK, GET_ALL_AUTHORS, GET_ALL_BOOKS } from "../queries";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(ADD_BOOK, {
    onError: (error) => {
      console.log(error);
    },
    onCompleted: () => {
      setTitle("");
      setPublished("");
      setAuthor("");
      setGenres([]);
      setGenre("");
    },
    update: (cache, response) => {
      cache.updateQuery({ query: GET_ALL_AUTHORS }, ({ allAuthors }) => {
        const newAuthorName = response.data.addBook.author.name;
        if (!allAuthors.find((a) => a.name === newAuthorName)) {
          return {
            allAuthors: allAuthors.concat(response.data.addBook.author),
          };
        }
        return { allAuthors };
      });

      cache.updateQuery({ query: GET_ALL_BOOKS }, ({ allBooks }) => {
        const newBook = response.data.addBook;
        if (!allBooks.find((b) => b.id === newBook.id)) {
          return {
            allBooks: allBooks.concat(newBook),
          };
        }
        return { allBooks };
      });
    },
  });

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    console.log("add book...");
    createBook({
      variables: { title, author, published: parseInt(published), genres },
    });
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form id="newBookForm" onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
