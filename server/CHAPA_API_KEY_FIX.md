# Fixing Invalid Chapa API Key Error

If you're getting the error: "Invalid API Key or the business can't accept payments at the moment", follow these steps:

## Step 1: Verify Your Chapa Account

1. Go to https://dashboard.chapa.co
2. Log in to your Chapa account
3. Make sure your account is:
   - Verified
   - Active
   - Able to accept payments

## Step 2: Get a Valid API Key

1. In your Chapa dashboard, go to **Settings** or **API Keys**
2. Look for **Test Keys** or **Secret Keys**
3. Copy your test key (should start with `CHASECK_TEST-`)
4. If you don't have a test key, generate a new one

## Step 3: Update Your .env File

1. Open `server/.env`
2. Update the `CHAPA_SECRET_KEY` line:
   ```env
   CHAPA_SECRET_KEY=CHASECK_TEST-your-actual-key-here
   ```
3. Make sure there are no extra spaces or quotes around the key
4. Save the file

## Step 4: Restart Your Backend Server

After updating the API key, restart your backend server:

```bash
cd server
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 5: Test Again

Try the payment flow again. The error should be resolved if:
- ✅ The API key is correct
- ✅ Your Chapa account is active
- ✅ The key is properly set in the .env file

## Troubleshooting

### Still getting "Invalid API Key" error?

1. **Double-check the key**: Make sure you copied the entire key without any extra characters
2. **Check for typos**: Verify there are no spaces before or after the key
3. **Regenerate the key**: Try generating a new test key from the Chapa dashboard
4. **Verify account status**: Make sure your Chapa account is fully verified and active
5. **Check server logs**: Look at the backend console for detailed error messages

### Need a new Chapa account?

1. Sign up at https://chapa.co
2. Complete the verification process
3. Get your test API key from the dashboard
4. Update your `.env` file with the new key

## Common Issues

- **Key has extra spaces**: Make sure there are no spaces around the `=` sign
- **Wrong key type**: Make sure you're using a **test key** (starts with `CHASECK_TEST-`) for development
- **Account not verified**: Complete the Chapa account verification process
- **Key expired**: Generate a new key from the dashboard

