from typing import Union

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import http3
import json

import sqlalchemy
import databases
from pydantic import BaseModel
from datetime import datetime
from typing import List

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

DATABASE_URL = "sqlite:///./test.db"

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

rates = sqlalchemy.Table(
    "rates",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("symbol", sqlalchemy.String),
    sqlalchemy.Column("rateUsd", sqlalchemy.Float),
    sqlalchemy.Column("updated", sqlalchemy.DateTime),
)

# In development mode, we are creating the tables in the python file
engine = sqlalchemy.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
metadata.create_all(engine)


class RateIn(BaseModel):
    symbol: str
    name: str
    rateUsd: float


class Rate(BaseModel):
    id: int
    symbol: str
    name: str
    rateUsd: float
    updated: datetime

# Connect and disconnect to the database


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# DB-interaction routes


@app.get("/rates/", response_model=List[Rate])
async def read_rates():
    query = rates.select()
    return await database.fetch_all(query)


@app.post("/rates/", response_model=Rate)
async def create_note(rate: RateIn):
    # Don't add a new rate if it already exists
    # We can use both sqlalchemy orm or raw sql
    # query = sqlalchemy.select(rates).where(rates.c.name == "Ethereum")
    query = f'SELECT rates.id FROM rates WHERE rates.name = "{rate.name}"'
    exists = await database.fetch_all(query)
    if (len(exists) > 0):
        # TODO: Instead of throwing an error, update the db rate and datetime values
        raise HTTPException(status_code=404, detail="Rate already exists")
    query = rates.insert().values(symbol=rate.symbol, name=rate.name,
                                  rateUsd=rate.rateUsd, updated=datetime.now())
    last_record_id = await database.execute(query)
    return {**rate.dict(), "id": last_record_id, "updated": datetime.now()}


# General routes
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


# External API routes

@app.get("/rates-external/{rate_id}")
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
