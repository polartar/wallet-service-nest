### How to install project?

    `yarn` or `npm install`

### How to run the project locally?

1. Configure .env variables

   GOOGLE_CLIENT_ID='Your Google Client ID'

   APPLE_CLIENT_ID='Your Apple Client ID'

2. Run the Docker

   If you didn't install the docker, please install it here:
   https://docs.docker.com/engine/install/

3. Run the server

   `npx nx serve gandalf`

### How to test this project?

1. Call the Login API
2. If the user exists, it will return the user id
3. If the user doesn't exist, it will create new user and return the user id.

### APIs

- Login User

  `http://localhost:3333/auth`
