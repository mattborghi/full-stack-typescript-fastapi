import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Rate {
  name: string;
  symbol: string;
  rateUsd: number;
}

interface RateIn extends Rate {
  id: number;
  updated: string;
}

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
      fetch(`http://0.0.0.0:8080/rates-external/bitcoin`).then((res) =>
        res.json()
      ),
  });

  const mutation = useMutation({
    mutationFn: (newRate: Rate) => {
      // TODO: use fetch instead of axios here
      return axios.post("http://0.0.0.0:8080/rates", newRate);
    },
  });

  const {
    isLoading: loadingRateDB,
    error: errorRateDB,
    data: rateDB,
  } = useQuery<RateIn[]>({
    queryKey: ["rateDB"],
    queryFn: () => fetch(`http://0.0.0.0:8080/rates`).then((res) => res.json()),
  });

  useEffect(() => {
    if (item) {
      console.log("items loaded");
      console.log(item);
    }
    if (rate) {
      console.log("External API loaded");
      console.log(rate);
    }
    if (rateDB) {
      // TODO: on mutation success we should run the query again
      // or store these values on the state and update this state with new mutation data results
      console.log("rateDB loaded");
      console.log(rateDB);
    }
  }, [item, rate, rateDB]);

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
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{rate.data.symbol}</td>
                <td>{parseFloat(rate.data.rateUsd).toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      <h3>Reading from SQL Lite table</h3>
      <div>
        {mutation.isLoading ? (
          "Adding rate..."
        ) : (
          <>
            {mutation.isError && axios.isAxiosError(mutation.error) && (
              <div style={{ color: "red" }}>
                An error occurred:{" "}
                {mutation.error.response?.data.detail ?? mutation.error.message}
              </div>
            )}
            {mutation.isSuccess ? <div>Rate added!</div> : null}

            <button
              style={{
                background: "blue",
                color: "white",
              }}
              onClick={() => {
                if (!rate.data || !rate.timestamp) return;
                console.log("mutating", rate.data);
                mutation.mutate({
                  name: rate.data.id,
                  symbol: rate.data.symbol,
                  rateUsd: parseFloat(rate.data.rateUsd),
                });
              }}
            >
              Create Rate
            </button>
          </>
        )}
      </div>
      <div>
        {loadingRateDB ? (
          "Getting DB table..."
        ) : (
          <>
            {errorRateDB ? <div>An error occurred: {errorRateDB}</div> : null}

            {rateDB && rateDB.length > 0 ? (
              <ul>
                {rateDB.map((row) => {
                  console.log(row);
                  return (
                    <li key={row.id}>
                      {row.name} - {row.rateUsd} @ {row.updated}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
