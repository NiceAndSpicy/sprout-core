const rp = require('request-promise')

module.exports.send = async function(phone, message) {
  console.log(`sending message "${message}" to ${phone}`)
  // mocked the sending of sms because messaging api is not yet ready
  const uri = process.env.SMS_URL
  await rp.post({ uri, body: { phone, message }, json: true })
}
