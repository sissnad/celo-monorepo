// Note: The contents of this file are not sent to the browser.

const AIRTABLE_API_KEY = 'keyQxGTQHP6hbVyMW'

const AIRTABLE_ANNOUNCEMENT_ID = 'appKO4w0GYrrwlgo0'
const AIRTABLE_BRANDKIT_ID = 'appRw7LLc6K8MYRXy'
const AIRTABLE_ECOFUND_ID = 'apppO5poOzAE5YYJN'
const AIRTABLE_ALLIANCE_ID = 'appXQ0QmakQqk6f6q'
const AIRTABLE_EVENTS_ID = 'applNDneAOqw3oHCO'
const AIRTABLE_FELLOW_ID = 'appkDZ6GFpgCxJPA9'
const IPSTACK_KEY = '9fd947653ba2871e1276eb1581f3996a'
const CONTENTFUL_SPACE_ID = 'bzlah72jow8z'
const CONTENTFUL_ACCESS_TOKEN = 'jsh_O9o2wVSvw4HcgLe47q0RgjKrfYTS8hLDIvdggC4'
const CONTENTFUL_PREVIEW_ACCESS_TOKEN = 'sgK_yFcEIU8YBW9ur4lhKCav_19UWAQnSRD-iLclBiM'
const environments = {
  development: {
    AIRTABLE_ALLIANCE_ID,
    AIRTABLE_ANNOUNCEMENT_ID,
    AIRTABLE_API_KEY,
    AIRTABLE_BRANDKIT_ID,
    AIRTABLE_ECOFUND_ID,
    AIRTABLE_EVENTS_ID,
    AIRTABLE_FELLOW_ID,
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    FIREBASE_LOGIN_PASSWORD: 'ZmVjNmY2ODUyMDU5MjE2Y2EyYzNkMGM0',
    FIREBASE_LOGIN_USERNAME: 'ashishb+faucet@celo.org',
    IPSTACK_KEY,
    MAILGUN_API_KEY: '5faedb84d5ec7631fae1cfe279f9da9d-1b65790d-e16d8566',
    MAILGUN_DOMAIN: 'sandboxf713144167a14a5b9029490498b9d9c9.mailgun.org',
    RECAPTCHA_SECRET: '6Lfcxa0UAAAAAOsgqHd3d0iKhS8o1Dcb-P5hKoFx',
    __ACTIVE_CAMPAIGN_API_KEY__:
      '4e4baa7f2f34a528dba6ade3dcffded1ccf25cbddbea36fd2653da1523476cb8dda13117',
  },
  production: {
    AIRTABLE_ALLIANCE_ID,
    AIRTABLE_ANNOUNCEMENT_ID,
    AIRTABLE_API_KEY,
    AIRTABLE_BRANDKIT_ID,
    AIRTABLE_ECOFUND_ID,
    AIRTABLE_EVENTS_ID,
    AIRTABLE_FELLOW_ID,
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    FIREBASE_LOGIN_PASSWORD: 'ZmVjNmY2ODUyMDU5MjE2Y2EyYzNkMGM0',
    FIREBASE_LOGIN_USERNAME: 'ashishb+faucet@celo.org',
    IPSTACK_KEY,
    MAILGUN_API_KEY: '5faedb84d5ec7631fae1cfe279f9da9d-1b65790d-e16d8566',
    MAILGUN_DOMAIN: 'sandboxf713144167a14a5b9029490498b9d9c9.mailgun.org',
    RECAPTCHA_SECRET: '6Ldkyq0UAAAAAKq71q3C1tIHkwnRImpPQF3Wcuez',
    __ACTIVE_CAMPAIGN_API_KEY__:
      '4e4baa7f2f34a528dba6ade3dcffded1ccf25cbddbea36fd2653da1523476cb8dda13117',
  },
  staging: {
    AIRTABLE_ALLIANCE_ID,
    AIRTABLE_ANNOUNCEMENT_ID,
    AIRTABLE_API_KEY,
    AIRTABLE_BRANDKIT_ID,
    AIRTABLE_ECOFUND_ID,
    AIRTABLE_EVENTS_ID,
    AIRTABLE_FELLOW_ID,
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    FIREBASE_LOGIN_PASSWORD: 'ZmVjNmY2ODUyMDU5MjE2Y2EyYzNkMGM0',
    FIREBASE_LOGIN_USERNAME: 'ashishb+faucet@celo.org',
    IPSTACK_KEY,
    MAILGUN_API_KEY: '5faedb84d5ec7631fae1cfe279f9da9d-1b65790d-e16d8566',
    MAILGUN_DOMAIN: 'sandboxf713144167a14a5b9029490498b9d9c9.mailgun.org',
    RECAPTCHA_SECRET: '6Lfcxa0UAAAAAOsgqHd3d0iKhS8o1Dcb-P5hKoFx',
    __ACTIVE_CAMPAIGN_API_KEY__:
      '4e4baa7f2f34a528dba6ade3dcffded1ccf25cbddbea36fd2653da1523476cb8dda13117',
  },
}

module.exports = environments[process.env.DEPLOY_ENV]
