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
    const status = isNotFound(e.message) ? 404 : 500
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
    const status = isNotFound(e.message) ? 404 : 500
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

app.post('/farmers/:farmerId/subscribe', async (req, res) => {
  try {
    const farmer = await farmers.get(req.params.farmerId)
    const locationIds = req.body.filter(isUnsubscribedFrom(farmer))
    for(const locationId of locationIds) {
      await locations.get(locationId)
    }
    const subscriptions = await farmers.addSubscriptions(farmer, locationIds)
    res.status(200).json(subscriptions)
  } catch (e) {
    const status = isNotFound(e.message) ? 404 : 500
    res.status(status).json({ error: e.message })
  }
})

function isNotFound(message) {
  return /not found/.test(message)
}

function isUnsubscribedFrom({ subscriptions }) {
  return (locationId) => !subscriptions.includes(locationId)
}

module.exports.handler = serverless(app)
