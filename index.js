// Be sure to add these ENV variables!
const {
  SENDOWL_API_KEY,
  SENDOWL_API_SECRET,
  KEYGEN_PRODUCT_TOKEN,
  KEYGEN_ACCOUNT_ID,
  KEYGEN_POLICY_ID,
  PORT = 8080
} = process.env

const fetch = require('node-fetch')
const crypto = require('crypto')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
const { SendOwl } = require('sendowl-node')
const sendowl = new SendOwl({
  host: 'www.sendowl.com',
  key: SENDOWL_API_KEY,
  secret: SENDOWL_API_SECRET
})

app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
app.use(bodyParser.json({ type: 'application/json' }))
app.use(morgan('combined'))

// 1. For new orders, SendOwl will make a GET request to this endpoint to generate a
//    license for the customer. Inside this route, we'll verify that the passed sale
//    is valid within SendOwl and then create a Keygen license resource. After that
//    has successfully been done, we'll render a 'success' page containing our user's
//    license key which they can use inside of our software product, e.g.:
//
//    curl -X POST https://api.keygen.sh/v1/accounts/$KEYGEN_ACCOUNT_ID/licenses/actions/validate-key \
//      -H 'Content-Type: application/vnd.api+json' \
//      -H 'Accept: application/vnd.api+json' \
//      -d '{
//            "meta": {
//              "key": "$KEYGEN_LICENSE_KEY"
//            }
//          }'
app.get('/sendowl-webhook', async (req, res) => {
  const { query } = req

  // If we aren't supplied with an order ID, the request is invalid.
  if (!query.order_id) {
    res.sendStatus(400)
    return
  }

  // 2. Fetch the SendOwl order resource to make sure our request is valid.
  const { order, error } = await new Promise((resolve, reject) => {
    sendowl.orders.get(query.order_id, (e, o) => e ? resolve(e) : resolve(o))
  })

  if (!order || error) {
    res.sendStatus(400)
    return
  }

  // 3. Create a user-less Keygen license for our new SendOwl customer.
  const response = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/licenses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEYGEN_PRODUCT_TOKEN}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json'
    },
    body: JSON.stringify({
      data: {
        type: 'licenses',
        attributes: {
          // Generate a short license key in the form of 'XXXX-XXXX-XXXX-XXXX' that we can
          // send to our customer via email and display on the success page.
          key: crypto.randomBytes(8).toString('hex').split(/(.{4})/).filter(Boolean).join('-'),
          metadata: {
            sendowlBuyerEmail: order.buyer_email,
            sendowlOrderId: order.id
          }
        },
        relationships: {
          policy: {
            data: { type: 'policies', id: KEYGEN_POLICY_ID }
          }
        }
      }
    })
  })

  const { data: license, errors } = await response.json()
  if (errors) {
    const error = errors.map(e => e.detail).toString()

    // If you receive an error here, then you may want to handle the fact the customer
    // may have been charged for a license that they didn't receive e.g. easiest way
    // would be to create the license manually, or refund their payment.
    console.error(`Received error while creating license for ${JSON.stringify(query)}:\n ${error}`)

    res.sendStatus(500)
    return
  }

  // 4. All is good! License was successfully created for the new SendOwl customer.
  //    We just have to send the key in plain-text now.
  const { attributes: { key } } = license

  res.setHeader('Content-Type', 'text/plain')
  res.send(key)
})

process.on('unhandledRejection', err => {
  console.error(`Unhandled rejection: ${err}`, err.stack)
})

const server = app.listen(PORT, 'localhost', () => {
  const { address, port } = server.address()

  console.log(`Listening at http://${address}:${port}`)
})