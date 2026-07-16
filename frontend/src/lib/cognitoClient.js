import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'
import { config } from '../config'

let userPool = null

// Created lazily (not at module load) so pages that don't need auth still render
// even before VITE_COGNITO_USER_POOL_ID / VITE_COGNITO_CLIENT_ID are configured.
function getUserPool() {
  if (userPool) return userPool

  if (!config.cognito.userPoolId || !config.cognito.clientId) {
    throw new Error('Cognito is not configured yet — set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in frontend/.env')
  }

  userPool = new CognitoUserPool({
    UserPoolId: config.cognito.userPoolId,
    ClientId: config.cognito.clientId,
  })
  return userPool
}

function getCognitoUser(email) {
  return new CognitoUser({ Username: email, Pool: getUserPool() })
}

export function signUp(email, password, name) {
  return new Promise((resolve, reject) => {
    const attributes = [new CognitoUserAttribute({ Name: 'email', Value: email })]
    if (name) attributes.push(new CognitoUserAttribute({ Name: 'name', Value: name }))

    getUserPool().signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export function confirmSignUp(email, otp) {
  return new Promise((resolve, reject) => {
    getCognitoUser(email).confirmRegistration(otp, true, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export function resendConfirmationCode(email) {
  return new Promise((resolve, reject) => {
    getCognitoUser(email).resendConfirmationCode((err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    const cognitoUser = getCognitoUser(email)

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
    })
  })
}

export function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    getCognitoUser(email).forgotPassword({
      onSuccess: (result) => resolve(result),
      onFailure: (err) => reject(err),
    })
  })
}

export function confirmPassword(email, otp, newPassword) {
  return new Promise((resolve, reject) => {
    getCognitoUser(email).confirmPassword(otp, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    })
  })
}

export function getCurrentSession() {
  return new Promise((resolve, reject) => {
    const cognitoUser = getUserPool().getCurrentUser()
    if (!cognitoUser) return resolve(null)

    cognitoUser.getSession((err, session) => {
      if (err) return reject(err)
      if (!session || !session.isValid()) return resolve(null)

      cognitoUser.getUserAttributes((attrErr, attrs) => {
        if (attrErr) return reject(attrErr)
        const profile = Object.fromEntries((attrs || []).map((a) => [a.getName(), a.getValue()]))
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          email: profile.email,
          name: profile.name,
        })
      })
    })
  })
}

export function signOut() {
  const cognitoUser = userPool?.getCurrentUser()
  if (cognitoUser) cognitoUser.signOut()
}
