const uuid = require('uuid/v4')
const dynamo = require('./dynamo')

const TableName = process.env.LOCATIONS_TABLE

const locations = {
  async get(locationId) {
    const Key = { locationId }
    const params = { TableName, Key }

    var item
    try {
      const result = await dynamo.get(params).promise()
      item = result.Item
    } catch (e) {
      console.error(e)
      throw new Error('Could not get location')
    }

    if(!item) throw new Error('Location not found')
    return item
  },
  async create({ barangay, municipality, province, longitude, latitude }) {
    const locationId = uuid()
    const Item = {
      locationId, barangay, municipality, province,
      longitude, latitude, subscribers: []
    }
    const params = { TableName, Item }

    try {
      await dynamo.put(params).promise()
      return Item
    } catch (e) {
      console.error(e)
      throw new Error('Could not create location')
    }
  },
  async addSubscribers(location, subscribers) {
    console.log(location)
    const newSubscribers = location.subscribers.concat(subscribers)
    const params = {
      TableName,
      Key: { locationId: location.locationId },
      UpdateExpression: 'set subscribers = :subs',
      ExpressionAttributeValues: { ':subs': newSubscribers }
    }

    try {
      await dynamo.update(params).promise()
      return newSubscribers
    } catch (e) {
      console.error(e)
      throw new Error('Could not update subscribers')
    }
  }
}

module.exports = locations
