const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')
const uuid = require('uuid/v4')
const AWS = require('aws-sdk')
const app = express()

const isOffline = process.env.IS_OFFLINE === 'true'
const dynamoOpts = isOffline ? { endpoint: 'http://localhost:8000' } : {}
const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoOpts)
const { FARMERS_TABLE, LOCATIONS_TABLE } = process.env

app.use(bodyParser.json({ strict: false }))

app.get('/farmers/:farmerId', async (req, res) => {
  const params = {
    TableName: FARMERS_TABLE,
    Key: { farmerId: req.params.farmerId }
  }

  try {
    const { Item } = await dynamoDb.get(params).promise()
    const { farmerId, name, phone, subscribed } = Item || {}
    const { status, body } = (Item)
      ? { status: 200, body: { farmerId, name, phone } }
      : { status: 404, body: { error: 'Farmer not found' } }
    res.status(status).json(body)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Could not get farmer' })
  }
})

app.post('/farmers', async (req, res) => {
  const farmerId = uuid()
  const { name, phone } = req.body

  const params = {
    TableName: FARMERS_TABLE,
    Item: { farmerId, name, phone, subscribed: [] }
  }

  try {
    await dynamoDb.put(params).promise()
    res.json(params.Item)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Could not create farmer' })
  }
})

app.get('/locations/:locationId', async (req, res) => {
  const params = {
    TableName: LOCATIONS_TABLE,
    Key: { locationId: req.params.locationId }
  }

  try {
    const { Item } = await dynamoDb.get(params).promise()
    const { locationId, barangay, municipality, province, longitude, latitude, subscribers } =
      Item || {}
    const { status, body } = (Item)
      ? { status: 200, body: { locationId, barangay, municipality, province, longitude, latitude } }
      : { status: 404, body: { error: 'Location not found' } }
    res.status(status).json(body)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Could not get location' })
  }
})

app.post('/locations', async (req, res) => {
  const locationId = uuid()
  const { barangay, municipality, province, longitude, latitude } = req.body

  const params = {
    TableName: LOCATIONS_TABLE,
    Item: { locationId, barangay, municipality, province, longitude, latitude, subscribers: [] }
  }

  try {
    await dynamoDb.put(params).promise()
    res.json(params.Item)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Could not create location' })
  }
})

module.exports.handler = serverless(app)
