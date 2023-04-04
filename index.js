const express = require("express")
const morgan = require("morgan")
const app = express()

// implement our own middleware (function that can handle request & response obj)
const requestLogger = (request, response, next) => {
  console.log("Method: ", request.method)
  console.log("Path: ", request.path)
  console.log("Body: ", request.body)
  console.log("---")
  next()
}
// next function calls the next middleware

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint" })
}

morgan.token("content", function (req, res) {
  return JSON.stringify(req.body)
})
const morganLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :content",
  {
    skip: function (req, res) {
      return req.method !== "POST"
    }
  }
)

app.use(express.json())
// app.use(requestLogger) // use our custom middleware, use statements in order of what gets used first
app.use(morganLogger)

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

// HTTP request handlers
app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>")
})

app.get("/info", (request, response) => {
  const body = `
    <p>Phonebook has info for ${persons.length} people.</p>
    <p>${Date()}</p>
  `
  response.send(body)
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).json({
      error: "Person not found"
    })
  }
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)

  if (!person) {
    return response.status(400).json({
      error: "Bad request"
    })
  }

  persons = persons.filter(p => p.id !== id)
  response.json(person)
})

app.post("/api/persons", (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Bad request"
    })
  }

  const existingPerson = persons.find(p => p.name === body.name)
  if (existingPerson) {
    return response.status(400).json({
      error: "Name already exists in phonebook"
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  response.json(person)
})

app.use(unknownEndpoint)

// methods
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0
  return maxId + 1
}

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
