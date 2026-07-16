import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const client = new SESClient({ region: process.env.AWS_REGION })
const SENDER_EMAIL = process.env.SES_SENDER_EMAIL as string

export async function sendReportEmail(toEmail: string, subject: string, html: string): Promise<string> {
  const result = await client.send(
    new SendEmailCommand({
      Source: SENDER_EMAIL,
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    }),
  )
  return result.MessageId as string
}
