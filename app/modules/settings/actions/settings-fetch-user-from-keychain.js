import keytar from "keytar"
import * as http from "http"

import { settingsSetUsername } from "./settings-set-username"
import { settingsLogoutUser } from "./settings-logout-user"

/**
 * PUBLIC: Update username in store based on token and redirect to populate page
 * if found
 *
 * @return async thunk action that resolves once set username is dispatched
 */
export const settingsFetchUserFromKeychain = () => {
  return async dispatch => {
    try {
      const token = await tokenInKeychain()
      if (token) {
        const username = await fetchUsername(token)
        if (username) {
          dispatch(settingsSetUsername(username))
          return username
        }
      }
      dispatch(settingsLogoutUser())
      return null
    } catch (error) {
      dispatch(settingsLogoutUser())
      return null
    }
  }
}

/**
 * PUBLIC: Fetch username from Classroom API using Access Token
 * Resolves with token if found, else resolves with null
 *
 * @return async thunk action that resolves with username
 */
export const fetchUsername = async (token) => {
  http.get(`http://classroom.github.com/api/internal/user?access_token=${token}`, (response) => {
    let body = ""

    if (response.statusCode !== 200) {
      return null
    }

    response.on("data", (chunk) => {
      body += chunk.toString()
    })

    response.on("end", () => {
      const json = JSON.parse(body)
      if (json.username) {
        return json.username
      }
      return null
    })
  }).on("error", () => {
    return null
  })
}

const tokenInKeychain = async () => {
  return keytar.getPassword("Classroom-Desktop", "x-access-token")
}
