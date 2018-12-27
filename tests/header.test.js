const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory');
const Page = require('./helper/page');
let page;
beforeEach(async ()=>{
    
  page = await Page.build();
    await page.goto('http://localhost:3000');
})

afterEach(async ()=>{
    await page.close();
})

test('The header has the correct text',async ()=>{
   
     
    const text = await page.textContentOf('a.brand-logo');
    expect(text).toEqual('Blogster')
})

test('clicking login start oauth flow',async ()=>{
    await page.click('.right a');

    const url = await page.url();
   // console.log(url);
    expect(url).toMatch(/accounts\.google\.com/)


})

test('When signed in shows logout button',async()=>{
  await page.login();
   const text = await page.textContentOf('a[href="/auth/logout"]');
        expect(text).toEqual('Logout')
})