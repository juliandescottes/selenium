/* Copyright 2023 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Demonstrates how to use a prototype for HAR file generation
 * using WebDriver BiDi network events.
 */

'use strict'

const firefox = require('../firefox')
const harBuilder = require('../bidi/harBuilder')
const BrowsingContext = require('../bidi/browsingContext')

const { Builder, logging, until } = require('..')

logging.installConsoleHandler()
logging.getLogger('webdriver.http').setLevel(logging.Level.ALL)
;(async function () {
  let driver
  let options = new firefox.Options()
    .setBinary(firefox.Channel.NIGHTLY)
    .enableBidi()
  try {
    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build()

    const id = await driver.getWindowHandle()
    const browsingContext = await BrowsingContext(driver, {
      browsingContextId: id,
    })

    const har = await harBuilder(driver, [id])
    await har.startRecording()

    await browsingContext.navigate('http://www.example.com')
    await driver.wait(until.titleIs('Example Domain'), 1000)

    const harExport = await har.stopRecording()
    console.log(JSON.stringify(harExport))
  } finally {
    if (driver) {
      await driver.quit()
    }
  }
})()
