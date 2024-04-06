import { useQuery } from "@apollo/client";
import { GET_ME, GET_ALL_BOOKS } from "../queries";
import BooksToShow from "./BooksToShow";

const Recommend = (props) => {
  const meResult = useQuery(GET_ME);
  const booksResult = useQuery(GET_ALL_BOOKS);

  if (!props.show) {
    return null;
  }

  if (meResult.loading || booksResult.loading) {
    return <div>loading ...</div>;
  }

  const genre = meResult.data?.me.favoriteGenre || "";

  const booksToShow =
    booksResult.data?.allBooks.filter((b) => b.genres.includes(genre)) || [];

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <b>{genre}</b>
      </p>
      <BooksToShow booksToShow={booksToShow} />
    </div>
  );
};

export default Recommend;
