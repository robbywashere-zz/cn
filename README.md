
# Install

`yarn install`
`npm install`

# Start

`yarn start`
`npm start`


# Httpie

[Download Httpie](https://httpie.org/)

## Create User

`http localhost:3000/user username=foo password='bar'`


## Auth User

`http --session=/tmp/mysession.json localhost:3000/auth username=foo password='bar'`


## Index Users

`http --session=/tmp/mysession.json localhost:3000/users`
