const puppeteer=require("puppeteer");

const linksArray= ["https://www.amazon.in", "https://www.flipkart.com/", "https://paytmmall.com"];
let productName=process.argv[2];
let currentPage;

(async function fn(){
    try {
        let browserOpenPromise=puppeteer.launch({
            headless:false,
            defaultViewport:null,
            args:["--start-maximized"]
        });
        let browser=await browserOpenPromise;
        let allTabsArr=await browser.pages();
        currentPage=allTabsArr[0];
        let amazonList=await getListingFromAmazon(linksArray[0],productName);
        console.table(amazonList);
        let flipkartList=await getListingFromFlipkart(linksArray[1],productName);
        console.table(flipkartList);
        let patymList=await getListingFromPatym(linksArray[2],productName);
        console.table(patymList);
    } catch (error) {
        console.log(error);
    }
})()

async function getListingFromAmazon(link,productName){
    await currentPage.goto(link);
    await currentPage.type('input[name="field-keywords"]',productName,{delay:10});
    await currentPage.click("#nav-search-submit-button");
    await currentPage.waitForSelector(".a-size-medium.a-color-base.a-text-normal",{visible:true});
    return currentPage.evaluate(getLists,
        ".s-include-content-margin.s-border-bottom.s-latency-cf-section",
        ".aok-inline-block.s-sponsored-label-info-icon",
        ".a-size-medium.a-color-base.a-text-normal",
        ".a-price-whole");
}

async function getLists(blockSelector,sponsoredIdentifier,nameSelector,priceSelector){
    
    let allBlocks=document.querySelectorAll(blockSelector);
    let list=[];

    for(let i=0;i<allBlocks.length;i++){
        let isSponsored=allBlocks[i].querySelector(sponsoredIdentifier);
        if(isSponsored==null){
            let nameElement=document.querySelectorAll(nameSelector);
            let priceElement=document.querySelectorAll(priceSelector);
            console.log(nameElement)
            console.log(priceElement);
            let name=nameElement[i].innerText;
            console.log(name)
            let price=priceElement[i].innerText;
            console.log(price)
            list.push({
                name,price
            })

            if(list.length==5){
                return list;
            }
        }
    }
}

async function  getListingFromFlipkart(link,productName){
    await currentPage.goto(link);
    await currentPage.click("._2KpZ6l._2doB4z");
    await currentPage.waitForSelector(".L0Z3Pu");
    await currentPage.type("._3704LK",productName,{delay:10});
    await currentPage.click(".L0Z3Pu");
    await currentPage.waitForSelector("._4rR01T",{visible:true});
    return currentPage.evaluate(getListsFlipkart,"._4rR01T","._30jeq3._1_WHN1");
}

async function getListsFlipkart(nameSelector,priceSelector){
    let nameElement=document.querySelectorAll(nameSelector);
    let priceElement=document.querySelectorAll(priceSelector);
    let list=[];

    for(let i=0;i<5;i++){
        let name=nameElement[i].innerText;
        let price=priceElement[i].innerText;
        list.push({
            name,price
        });
    }

    return list;
}

async function getListingFromPatym(link,productName){
    await currentPage.goto(link);
    await currentPage.waitForSelector("input[type='search']");
    await currentPage.type("input[type='search']",productName,{delay:200});
    await  currentPage.keyboard.press("Enter");
    await currentPage.waitForSelector(".UGUy",{visible:true});
    return currentPage.evaluate(getListsPatym,".UGUy","._1kMS");
}


async function getListsPatym(nameSelector,priceSelector){
    let nameElement=document.querySelectorAll(nameSelector);
    let priceElement=document.querySelectorAll(priceSelector);
    let list=[];

    for(let i=0;i<5;i++){
        let name=nameElement[i].innerText;
        let price=priceElement[i].innerText;
        list.push({
            name,price
        });
    }

    return list;
}