const express = require('express')
const app = express()
app.use(express.json())
const morgan = require('morgan')
const cors = require('cors')
app.use(cors())

morgan.token('data', function(req, res) {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.static('dist'))

require('dotenv').config()
const Person = require('./models/person')

app.get('/api/persons', (request, response) => {
    Person.find({})
    .then(persons => {
      console.log(persons)
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.find({})
    .then(persons => {
      const number_of_persons = persons.length
      const date = new Date()
      response.send(`<p> Phonebook has info for ${number_of_persons} people<p/>        
                    <p>${date}<p/>`
                    )
    })
    .catch(error => next(error))
    
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findOneAndDelete({ _id: request.params.id })
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new:true })
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
    const body = request.body
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    person.save()
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}) 