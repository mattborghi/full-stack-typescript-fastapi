from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import http3
import json

client = http3.AsyncClient()

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.get("/rates/{rate_id}")
async def read_rate(rate_id: str):
    """ Call the external API of Coincap the gets the current rate of a given coin.

    Args:
        rate_id (str): name of the coin to get the current rate.

    Returns:
        id:	unique identifier for asset or fiat
        symbol:	most common symbol used to identify asset or fiat
        currencySymbol:	currency symbol used to identify asset or fiat
        rateUsd: rate conversion to USD
        type: type of currency - fiat or crypto
    """
    url = f"https://api.coincap.io/v2/rates/{rate_id}"
    print(url)
    r = await client.get(url)
    return json.loads(r.text)
