import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import "./App.css";

function App() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: () =>
      fetch("http://0.0.0.0:8080/items/1?q=another").then((res) => res.json()),
  });

  useEffect(() => {
    if (!data) return;
    console.log(data);
  }, [data]);

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error;

  return <h1>Testing</h1>;
}

export default App;
