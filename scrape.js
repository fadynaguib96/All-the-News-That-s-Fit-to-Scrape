
var cheerio = require("cheerio");

var axios = require("axios");




var result = {}


axios.get("https://www.usatoday.com/sports/soccer/").then(function (response) {

    var $ = cheerio.load(response.data);

    $("a.hgpm-link").each(function (i, element) {

        var link = "https://www.usatoday.com" + $(element).attr("href")
        

        // console.log(link)

    

        axios.get(link).then(function (response) {
            
            var $ = cheerio.load(response.data);
            
            var title = $("h1.asset-headline").text()

            var summary = $("p.speakable-p-1").text()

            result.title = title
            result.link = link
            result.summary = summary
    
            console.log(result)
        })



        

    })

 

})








