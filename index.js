const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const app = express()

morgan.token("content", function (req, res) {
  return JSON.stringify(req.body)
})
const morganLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :content"
  // {
  //   skip: function (req, res) {
  //     return req.method !== "POST" || req.method !== "PUT"
  //   }
  // }
)

app.use(express.json())
app.use(cors())
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

app.put("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "bad request"
    })
  }

  const updatedPerson = {
    id: id,
    name: body.name,
    number: body.number
  }

  persons = persons.map(p => (p.id !== id ? p : updatedPerson))
  response.json(updatedPerson)
})

// methods
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0
  return maxId + 1
}

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
