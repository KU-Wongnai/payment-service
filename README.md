# KU Wongnai - Payment Service

Handle everything about payment including charging credit card and store card information and more, using [Omise](https://www.opn.ooo/th-en/) as a payment gateway. Currently support only credit card.

## How it works

![diagram](https://cdn.omise.co/assets/developer-documents/images_jpg/small_token@2x.jpg)

Please refer to the [Omise documentation](https://docs.opn.ooo/omise-js) for more information.

## Tech Stack

- [omise-node](https://github.com/omise/omise-node)
- [redis](https://redis.io/)

## Setup

### Install dependencies

Install `pnpm` if you don't have it yet.

```sh
npm install -g pnpm
```

```sh
pnpm install
```

### Run the app

Copy `.env.example` to `.env` and fill in the environment variables.

```sh
cp .env.example .env
```

```sh
JWT_SECRET= # from user-service

REDIS_HOST=localhost
REDIS_PORT=6380
```

Start redis server

```sh
docker-compose up -d
```

Start the server in development mode

```sh
pnpm dev
```

Start the server in production mode

```sh
pnpm start
```

## API

service run at http://localhost:8095

**All route require authentication**

### Charge the credit card

> POST -> /api/checkout

```json
{
  amount: 100, // in THB
  tokenId: <token_id>, // from Omise.js
  billId: "123", // for description
  save, // boolean type to save card or not
  cardId, // specify card id to charge
}
```

### Get customer information for the current user

> GET -> /api/customers/me

## TODOs

- [ ] Transfer money to restaurant and rider
- [ ] Validate incoming request
- [ ] Add more error handling
