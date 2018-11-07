const AWS = require('aws-sdk')

const isOffline = process.env.IS_OFFLINE === 'true'
const dynamoOpts = isOffline ? { endpoint: 'http://localhost:8000' } : {}
const dynamo = new AWS.DynamoDB.DocumentClient(dynamoOpts)
module.exports = dynamo
