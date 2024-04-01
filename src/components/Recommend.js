import { useQuery } from "@apollo/client";
import { GET_ME } from "../queries";
import Books from "./Books";

const Recommend = (props) => {
  const result = useQuery(GET_ME, {
    skip: !props.show,
    fetchPolicy: 'cache-and-network'    
  });

  if (result.loading) {
    return <div>loading...</div>;
  }
  
  if (!props.show) {
    return null
  }

  const genre = result.data?.me.favoriteGenre

  return (
    <div>
      <h2>Recommendations</h2>
      <p>books in your favorite genre <b>{genre}</b></p>
      <Books show={true} genre={genre} />
    </div>
  )
}

export default Recommend;