const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')

const locations = require('./lib/locations')
const farmers = require('./lib/farmers')

const app = express()

app.use(bodyParser.json({ strict: false }))

app.get('/farmers/:farmerId', async (req, res) => {
  try {
    const farmer = await farmers.get(req.params.farmerId)
    res.status(200).json(farmer)
  } catch (e) {
    const status = e.message === 'Farmer not found' ? 404 : 500
    res.status(status).json({ error: e.message })
  }
})

app.post('/farmers', async (req, res) => {
  try {
    const farmer = await farmers.create(req.body)
    res.status(400).json(farmer)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/locations/:locationId', async (req, res) => {
  try {
    const location = await locations.get(req.params.locationId )
    res.status(200).json(location)
  } catch (e) {
    const status = e.message === 'Location not found' ? 404 : 500
    res.status(status).json({ error: e.message })
  }
})

app.post('/locations', async (req, res) => {
  try {
    const location = await locations.create(req.body)
    res.status(200).json(location)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports.handler = serverless(app)
