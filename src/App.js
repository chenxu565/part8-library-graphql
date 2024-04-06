import { useState, useEffect } from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommend from "./components/Recommend";
import { GET_ME } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  const [getMe] = useLazyQuery(GET_ME, {
    fetchPolicy: "network-only",
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
