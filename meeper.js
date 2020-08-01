require('dotenv').config()
const puppeteer = require('puppeteer');
const fs = require('fs')

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

(async () => {
  // setup browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // navigate to needed page
  await page.goto('https://app.dnbhoovers.com');
  console.log('Page Loaded')

  // following code specific to dnbhoovers
  // login
  await page.waitForSelector('input[name="username"]', { visible: true });
  await page.type('input[name="username"]', process.env.DB_USER, { delay: 100 });
  console.log('Username Typed')

  await page.click('.continue-btn')
  console.log('Continue Button Clicked')

  await delay(2000);
  await page.waitForSelector('input[name="password"]', { visible: true });
  await page.type('input[name="password"]', process.env.DB_PASS, { delay: 100 });
  console.log('Password Typed')

  await delay(2000);
  await page.click('.continue-btn')
  console.log('Continue Button Clicked')


  // now logged in - verify login
  await delay(3000);
  await page.screenshot({ path: './img/home.png' });
  console.log('Logged In!')

  // navigate to contact page
  await page.goto('https://app.dnbhoovers.com/search/contact');
  // verify page load
  await delay(4000)
  await page.screenshot({ path: './img/searchContact.png' });
  console.log('Contact Search Page Loaded')

  // start inputting search terms
  await page.waitForSelector('input[name="cityFacet"]');
  await page.type('input[name="cityFacet"]', 'South Jordan', { delay: 100 });
  await delay(1000)

  // test input
  await page.screenshot({ path: './img/testCity.png' })
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.screenshot({ path: './img/testCitySelected.png' })
  await delay(1000)

  await page.click('.btn-submit')

  await delay(3000)
  await page.screenshot({ path: './img/testCityResults.png' })
  console.log('Got Results')

  const contactData = await page.$$eval('div.container-fluid', nodes => {
    console.log('Evaluating Now')
    return nodes.map(node => {
      const name = node.querySelector('.name-row').textContent.trim()

      return {
        name,
      }
    })
  });

  // console.log(contactData)

  fs.writeFile(
    './json/contacts.json',
    JSON.stringify(contactData, null, 2),
    (err) => err ? console.error('Data not written!', err) : console.log('Data written!')
  )

  // logout
  console.log('Logging Out')
  await page.goto('https://app.dnbhoovers.com/logout')
  await page.screenshot({ path: './img/logout.png' });

  // close browser
  await browser.close();
})();
