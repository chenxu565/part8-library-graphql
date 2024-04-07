import { useState, useEffect } from "react";
import { useApolloClient, useLazyQuery, useSubscription } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommend from "./components/Recommend";
import {
  GET_ME,
  BOOK_ADDED,
  GET_ALL_AUTHORS,
  GET_ALL_BOOKS,
  AUTHOR_BIRTH_YEAR_EDITED,
} from "./queries";

export const updateAddedBookCache = (cache, addedBook) => {
  cache.updateQuery({ query: GET_ALL_AUTHORS }, ({ allAuthors }) => {
    const newAuthorName = addedBook.author.name;
    if (!allAuthors.find((a) => a.name === newAuthorName)) {
      return {
        allAuthors: allAuthors.concat(addedBook.author),
      };
    }
    return { allAuthors };
  });

  cache.updateQuery({ query: GET_ALL_BOOKS }, ({ allBooks }) => {
    if (!allBooks.find((b) => b.id === addedBook.id)) {
      window.alert(`New book added: ${addedBook.title}`);
      return {
        allBooks: allBooks.concat(addedBook),
      };
    }
    return { allBooks };
  });
};

export const updateEditedAuthorBirthYearCache = (cache, editedAuthor) => {
  cache.updateQuery({ query: GET_ALL_AUTHORS }, ({ allAuthors }) => {
    const authorToUpdate = allAuthors.find((a) => a.id === editedAuthor.id);
    if (authorToUpdate && authorToUpdate.born !== editedAuthor.born) {
      return {
        allAuthors: allAuthors.map((a) =>
          a.id === editedAuthor.id ? { ...a, born: editedAuthor.born } : a,
        ),
      };
    }
    return { allAuthors };
  });
};

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  const [getMe] = useLazyQuery(GET_ME, {
    fetchPolicy: "network-only",
  });

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      updateAddedBookCache(client.cache, addedBook);
    },
  });

  useSubscription(AUTHOR_BIRTH_YEAR_EDITED, {
    onData: ({ data }) => {
      const authorToUpdate = data.data.authorUpdated;
      updateEditedAuthorBirthYearCache(client.cache, authorToUpdate);
    },
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("library-user-token");
    if (storedToken) {
      setToken(storedToken);
      getMe();
    }
  }, [getMe]);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.cache.writeQuery({
      query: GET_ME,
      data: { me: null },
    });
    setPage("login");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <LoginForm
        show={page === "login"}
        token={token}
        setToken={setToken}
        setPage={setPage}
        getMe={getMe}
      />

      <Recommend show={page === "recommend"} />
    </div>
  );
};

export default App;
