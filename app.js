// importing the modules required fro the scraper api
const axios = require("axios")
const cheerio = require("cheerio")
const express = require("express")

const app = express();
const port = 3000 || env.PORT

async function getPrices() {
    try {
        // the coinmarketcap website where we are taking scraping the data for cryptocurrency prices
        const priceSite = "https://coinmarketcap.com/"

        const { data } = await axios({
            method: "GET",
            url: priceSite
        })

        // using cheerio to target the html data from the coinmarketcap website
        const $ = cheerio.load(data)

        // an object representing the format in which the data from the website for a coin will be shown
        const elemSelector = '#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div > div.h7vnx2-1.bFzXgL > table > tbody > tr'
        
        const coinObject = [
            'rank',
            'name',
            'price',
            '24hr_PriceChange_%',
            '7dy_PriceChange_%',
            'marketCap',
            'volume',
            'circulatingSupply'
        ]

        const cryptoCoinArray = []

        $(elemSelector).each((parentId, parentElem) => {
            let keyId = 0

            const cryptoCoin = {}

            if (parentId <= 9) {
                $(parentElem).children().each((childId, childElem) => {
                    let childElemValues = $(childElem).text()
                    
                    if ( keyId === 1 || keyId === 6 ) {
                        childElemValues = $('p:first-child', $(childElem).html()).text()
                    }

                    if (childElemValues) {
                        cryptoCoin[coinObject[keyId]] = childElemValues
                        keyId++
                    }
                })
                cryptoCoinArray.push(cryptoCoin)
            }
        })

        return cryptoCoinArray

    } catch (error) { 
        console.log(error)
    }
}

app.get("/", (req, res) => {
    res.end("Navigate to: /api/crypto-price-feed")
})

app.get("/api/crypto-price-feed", async(req, res) => {
    try {
        const priceFeed = await getPrices()
        return res.status(200).json({result: priceFeed})
    } catch (error) {
        return res.status(500).json({error: errror.toString()})
    }
} )

app.listen(port, () => {
    console.log("Server is listening on port 3000....")
})