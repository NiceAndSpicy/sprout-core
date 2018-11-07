const sms = require('./lib/sms')
const locations = require('./lib/locations')

const events = {
  farmerCreatedHandler: async function(event, context, cb) {
    try {
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
    } catch (e) {
      cb(e)
    }
  },
  farmerSubscribedHander: async function(event, context, cb) {
    try {
      const isExistingFarmer = (record) => record.eventName === 'MODIFY'
      const transform = ({ dynamodb }) => ({
        phone: dynamodb.NewImage.phone.S,
        newSubs: dynamodb.NewImage.subscriptions.L.map(({ S }) => S),
        oldSubs: dynamodb.OldImage.subscriptions.L.map(({ S }) => S)
      })
      const updates = event.Records.filter(isExistingFarmer).map(transform)
      const promises = updates.map(async ({ phone, newSubs, oldSubs }) => {
        const recentSubs = newSubs.filter(isRecentlySubbed(oldSubs))
        const promises = recentSubs.map(async (locationId) => {
          const location = await locations.get(locationId)
          await locations.addSubscribers(location, [ phone ])
        })
        await Promise.all(promises)
      })
      await Promise.all(promises)
      cb()
    } catch (e) {
      cb(e)
    }
  },
  locationNewSubscriptionHandler: async function(event, context, cb) {
    try {
      const isExistingLocation = (record) => record.eventName === 'MODIFY'
      const transform = ({ dynamodb }) => ({
        barangay: dynamodb.NewImage.barangay.S,
        municipality: dynamodb.NewImage.municipality.S,
        province: dynamodb.NewImage.province.S,
        newSubs: dynamodb.NewImage.subscribers.L.map(({ S }) => S),
        oldSubs: dynamodb.OldImage.subscribers.L.map(({ S }) => S)
      })
      const updates = event.Records.filter(isExistingLocation).map(transform)
      const promises = updates.map(async (location) => {
        const { barangay, municipality, province } = location
        const { newSubs, oldSubs } = location
        const recentSubs = newSubs.filter(isRecentlySubbed(oldSubs))
        const promises = recentSubs.map(async (phone) => {
          const message = 'You have been subscribed to the weather updates ' +
            `for ${barangay}, ${municipality}, ${province}. You will receive ` +
            'the latest weather updates every 12 hours.'
          await sms.send(phone, message)
        })
        await Promise.all(promises)
      })
      await Promise.all(promises)
      cb()
    } catch (e) {
      cb(e)
    }
  }
}

function isRecentlySubbed(oldSubs) {
  return (sub) => !oldSubs.includes(sub)
}

module.exports = events
