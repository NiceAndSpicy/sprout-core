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
    const { barangay, municipality, province, longitude, latitude } = item
    return { locationId, barangay, municipality, province, longitude, latitude }
  },
  async create({ barangay, municipality, province, longitude, latitude }) {
    const locationId = uuid()
    const Item = { locationId, barangay, municipality, province, longitude, latitude, subscribers: [] }
    const params = { TableName, Item }

    try {
      await dynamo.put(params).promise()
      return { locationId, barangay, municipality, province, longitude, latitude }
    } catch (e) {
      console.error(e)
      throw new Error('Could not create location')
    }
  }
}

module.exports = locations