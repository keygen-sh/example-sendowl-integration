# Example Keygen + SendOwl integration
The following web app is written in Node.js and shows how to integrate
[Keygen](https://keygen.sh) and [SendOwl](https://www.sendowl.com) together
using SendOwl's "from URL" license key generation option.

> **This example application is not 100% production-ready**, but it should
> get you 90% of the way there. You may need to add additional logging,
> error handling, validation, features, etc.

## Running the app locally

First up, configure a few environment variables:
```bash
# Your SendOwl API key (available under Settings->Advanced->API)
export SENDOWL_API_KEY="YOUR_SENDOWL_API_KEY"

# Your SendOwl API secret (available under Settings->Advanced->API)
export SENDOWL_API_SECRET="YOUR_SENDOWL_API_SECRET"

# Keygen product token (don't share this!)
export KEYGEN_PRODUCT_TOKEN="YOUR_KEYGEN_PRODUCT_TOKEN"

# Your Keygen account ID
export KEYGEN_ACCOUNT_ID="YOUR_KEYGEN_ACCOUNT_ID"

# The Keygen policy to use when creating licenses for new customers
# after they successfully purchase your product
export KEYGEN_POLICY_ID="YOUR_KEYGEN_POLICY_ID"
```

You can either run each line above within your terminal session before
starting the app, or you can add the above contents to your `~/.bashrc`
file and then run `source ~/.bashrc` after saving the file.

Next, install dependencies with [`yarn`](https://yarnpkg.comg):
```
yarn
```

Then start the app:
```
yarn start
```

## Testing license keygen locally

For local development, create an [`ngrok`](https://ngrok.com) tunnel:
```
ngrok http 8080
```

Next up, add the secure `ngrok` URL to your license-key enabled SendOwl product.

1. **SendOwl:** add `https://{YOUR_NGROK_URL}/sendowl-webhook?order_id={{order.id}}&product_id={{product.id}}`
   as the license key "from URL" to your product (note the [liquid](https://www.sendowl.com/liquid)
   URL parameters, which are required! [More info](https://help.sendowl.com/help/adding-a-software-product#different-ways-of-providing-codes-serials-keys).)

## Testing the integration

Set up a SendOwl purchase form and create a test purchase.

## Questions?

Reach out at [support@keygen.sh](mailto:support@keygen.sh) if you have any
questions or concerns!