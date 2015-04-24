# Nootti
>The note taking app.


## Install

Nootti requires Node and MongoDB to be installed.


**Install packages and dependencies**

`$ bower install`

and

`$ npm install`

## Usage

Start MongoDB `$ mongod`

Run the app `$ node server.js`

Head to `http://localhost:8080`



### API specs

Nootti REST api

| Route          | HTTP verb | Description |
| -----          | --------- | ----------- |
| /api/notes     | GET  | Get all titles |
| /api/notes     | POST | Create new note |
| /api/notes/:id | GET  | Get all data of a note |
| /api/notes/:id | PUT  | Update note (auto save) |
| /api/notes/:id | DELETE | Delete a note |

