const sms = require('./lib/sms')

const events = {
  farmerCreatedHandler: async function(event, context, cb) {
    const isNewFarmer = (record) => record.eventName === 'INSERT'
    const transform = ({ dynamodb }) => ({
      farmerId: dynamodb.NewImage.farmerId.S,
      name: dynamodb.NewImage.name.S,
      phone: dynamodb.NewImage.phone.S
    })
    const sendMessage = ({ name, phone }) =>
      sms.send(phone, `Hello ${name}, welcome to Sprout! We wish you a bountiful harvest!`)

    const newFarmers = event.Records.filter(isNewFarmer).map(transform)
    await Promise.all(newFarmers.map(sendMessage))
    cb()
  }
}

module.exports = events
