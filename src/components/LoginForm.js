import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const LoginForm = ({show, token, setToken, setPage}) => {
  const [username, setUsername] = useState("mluukkai");
  const [password, setPassword] = useState("secret");

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
    },
  })
  
  useEffect(() => {
    if ( result.data ) {
      const tokenFetched = result.data.login.value;
      setToken(tokenFetched);
      localStorage.setItem("library-user-token", tokenFetched);
      setPage("authors");
    }
  }, [result.data, setPage, setToken])

  const submit = async (event) => {
    event.preventDefault();
    login({ variables: { username, password }});
  }

  if (!show) {
    return null
  }
  
  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm;