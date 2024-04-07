import { useQuery } from "@apollo/client";
import { useState } from "react";
import { GET_ALL_BOOKS } from "../queries";
import BooksToShow from "./BooksToShow";

const Books = (props) => {
  const [genreTab, setGenreTab] = useState("all genres");
  const booksResult = useQuery(GET_ALL_BOOKS);

  if (!props.show) {
    return null;
  }

  if (booksResult.loading) {
    return <div>loading...</div>;
  }

  const books = booksResult.data?.allBooks || [];
  const allBookGenres = books.map((b) => b.genres).flat();
  const uniqueGenres = [...new Set(allBookGenres)];
  const buttonGenres = [...uniqueGenres, "all genres"];

  const toggleGenre = (genre) => {
    setGenreTab(genre);
  };

  const booksToShow =
    genreTab === "all genres"
      ? books
      : books.filter((b) => b.genres.includes(genreTab));

  return (
    <div>
      {true && (
        <>
          <h2>Books</h2>
          {buttonGenres.map((genre) => (
            <button key={genre} onClick={() => toggleGenre(genre)}>
              {genre}
            </button>
          ))}
          {genreTab === "all genres" ? (
            <p>
              <b>All genres</b>
            </p>
          ) : (
            <p>
              in genre <b>{genreTab}</b>
            </p>
          )}
        </>
      )}
      <BooksToShow booksToShow={booksToShow} />
    </div>
  );
};

export default Books;
