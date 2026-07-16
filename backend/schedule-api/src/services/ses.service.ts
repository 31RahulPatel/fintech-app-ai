import { SESClient, VerifyEmailIdentityCommand } from '@aws-sdk/client-ses'

const client = new SESClient({ region: process.env.AWS_REGION })

/**
 * Triggers SES's own "confirm this email address" flow — AWS emails the address a
 * verification link, and once clicked, that address becomes a verified SES identity
 * and can receive mail even while the account is in sandbox mode. This is how the app
 * supports other users' inboxes without needing full SES production access first.
 */
export async function requestEmailVerification(email: string): Promise<void> {
  await client.send(new VerifyEmailIdentityCommand({ EmailAddress: email }))
}
