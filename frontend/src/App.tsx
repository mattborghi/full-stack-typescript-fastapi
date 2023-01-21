import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import "./App.css";

function App() {
  const {
    isLoading: loadingItem,
    error: errorItem,
    data: item,
  } = useQuery({
    queryKey: ["item"],
    queryFn: () =>
      fetch("http://0.0.0.0:8080/items/1?q=another").then((res) => res.json()),
  });

  const {
    isLoading: loadingRate,
    error: errorRate,
    data: rate,
  } = useQuery({
    queryKey: ["rate"],
    queryFn: () =>
      fetch(`http://0.0.0.0:8080/rates/bitcoin`).then((res) => res.json()),
  });

  useEffect(() => {
    if (item) {
      console.log(item);
    }
    if (rate) {
      console.log(rate.data);
    }
  }, [item, rate]);

  if (loadingItem || loadingRate) return <h1>"Loading..."</h1>;

  if (errorItem) return <h1>{"An error has occurred: " + errorItem}</h1>;

  if (errorRate) return <h1>{"An error has occurred: " + errorRate}</h1>;

  return (
    <div>
      <h1>Testing</h1>
      {rate.data && (
        <>
          <h3>Reading from external API</h3>
          <table>
            <tr>
              <th>Symbol</th>
              <th>Rate</th>
            </tr>
            <tr>
              <td>{rate.data.symbol}</td>
              <td>{parseFloat(rate.data.rateUsd).toFixed(0)}</td>
            </tr>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
