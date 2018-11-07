const uuid = require('uuid/v4')
const dynamo = require('./dynamo')

const TableName = process.env.FARMERS_TABLE

const farmers = {
  async get(farmerId) {
    const Key = { farmerId }
    const params = { TableName, Key }

    var item
    try {
      const result = await dynamo.get(params).promise()
      item = result.Item
    } catch (e) {
      console.error(e)
      throw new Error('Could not get farmer')
    }

    if(!item) throw new Error('Farmer not found')
    const { name, phone } = item
    return { farmerId, name, phone }
  },
  async create({ name, phone }) {
    const farmerId = uuid()
    const Item = { farmerId, name, phone, subscriptions: [] }
    const params = { TableName, Item }

    try {
      await dynamo.put(params).promise()
      return { farmerId, name, phone }
    } catch (e) {
      console.error(e)
      throw new Error('Could not create farmer')
    }
  }
}

module.exports = farmers
