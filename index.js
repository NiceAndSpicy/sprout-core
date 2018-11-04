const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')
const uuid = require('uuid/v4')
const AWS = require('aws-sdk')
const app = express()

const isOffline = process.env.IS_OFFLINE === 'true'
const dynamoOpts = isOffline ? { endpoint: 'http://localhost:8000' } : {}
const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoOpts)
const { FARMERS_TABLE } = process.env

app.use(bodyParser.json({ strict: false }))

app.get('/farmers/:farmerId', async (req, res) => {
  const params = {
    TableName: FARMERS_TABLE,
    Key: { farmerId: req.params.farmerId }
  }

  try {
    const { Item } = await dynamoDb.get(params).promise()
    const { farmerId, name, phone } = Item || {}
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
    Item: { farmerId, name, phone }
  }

  try {
    await dynamoDb.put(params).promise()
    res.json(params.Item)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Could not create farmer' })
  }
})

module.exports.handler = serverless(app)
