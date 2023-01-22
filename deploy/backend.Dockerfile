FROM python:3.9

# set working directory
WORKDIR /backend

# set environment varibles
# prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
# prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

# install system dependencies
RUN apt-get update && \
    apt-get -y install netcat gcc && \
    apt-get clean
# Upgrade pip
RUN pip install --upgrade pip

COPY ./backend/requirements.txt /backend/requirements.txt
COPY ./backend/src/ /backend/src/

# install python dependencies
RUN pip install -r requirements.txt

CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8080"]