
# Install

`yarn install`
`npm install`

# Requirements #

- postgres 9.6+

- development environment uses .env file in the root, expecting ...
    
  ```
  DB_USERNAME="postgres"
  DB_HOST="localhost"
  DB_NAME="postgres"
  ```
- `yarn db:bootstrap` `npm run db:bootstrap`


# Start

`yarn start`
`npm start`


# Httpie

[Download Httpie](https://httpie.org/)

## Create User

`http localhost:3000/user username=foo password='bar' email='foo@bar.com'`


## Auth User

`http --session=/tmp/mysession.json localhost:3000/auth username=foo password='bar'`


## Index Users

`http --session=/tmp/mysession.json localhost:3000/users`
