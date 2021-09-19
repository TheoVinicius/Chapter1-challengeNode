const express = require('express');
const cors = require('cors');

const {
  v4: uuidv4
} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// id, name, username, todos[]
// id, title, done, deadline, created_at

function checksExistsUserAccount(request, response, next) {
  const {
    username
  } = request.headers;

  if (!username) {
    return response.status(400).send();
  }

  request.user = users.find(user => user.username === username);

  console.log(request.user);

  next();
}

app.post('/users', (request, response) => {

  const {
    name,
    username
  } = request.body;

  if (!name || !username) {
    return response.status(400).send();
  }

  if (users.some(user => user.username === username)) {
    return response.status(400).send({
      error: 'User already exists'
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const {
    user
  } = request;

  response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const {
    user
  } = request;

  const {
    title,
    deadline
  } = request.body;

  if (!title || !deadline) {
    res.status(400).send({
      error: 'Missing Data'
    });
  }

  const data = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  }

  user.todos.push(data);


  response.status(201).json(data);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {
    user
  } = request;

  const {
    id
  } = request.params;

  const {
    title,
    deadline
  } = request.body;

  const todo = user.todos.find(todo => todo.id === todo.id);

  if (!todo) {
    return response.status(404).send({
      error: 'Todo not found'
    });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const {
    user
  } = request;

  const {
    id
  } = request.params;
  

  const todo = user.todos.find(todo => todo.id === todo.id);

  if (!todo) {
    return response.status(404).send({
      error: 'Todo not found'
    });
  }

  todo.done = true;

  response.status(200).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {
    user
  } = request;

  const {
    id
  } = request.params;

  if (!user.todos.find(todo => todo.id === id)) {
    return response.status(404).send({error: 'Todo not found'});
  }

  user.todos = user.todos.filter(todo => todo.id !== id);

  response.status(204).send();

});

module.exports = app;