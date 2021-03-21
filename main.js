//require modules
let request = require("request");
let cheerio = require("cheerio");
let fs = require('fs');
let path = require('path');
let PDFDocument = require('pdfkit');

//Main url of site
let url = "https://github.com/topics";

//request for url
request(url, cb);
//callback function
function cb(error, response, html) {
    if (error) {
        console.log(error);
    }
    else {
        exactHtml(html);
    }
}

function exactHtml(html) {
    let selectorTool = cheerio.load(html);
    let selectElem = selectorTool(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");
    let all_topic_link = selectorTool("a.no-underline.d-flex.flex-column.flex-justify-center");
    for (let i = 0; i < selectElem.length; i++) {
        let topic = selectorTool(selectElem[i]).text();
        let topic_link = selectorTool(all_topic_link[i]).attr("href");
        let full_link = "https://github.com" + topic_link;
        openLink(full_link);
    }
}

function openLink(link) {
    request(link, cb);
    function cb(error, response, html) {
        if (error) {
            console.log(error);
        }
        else {
            exact_repo_link(html);
        }
    }
}

function exact_repo_link(html) {
    let selectorTool = cheerio.load(html);
    let arr = selectorTool("a.text-bold");
    let topicElem = selectorTool(".h1-mktg");
    let topic = topicElem.text()
    topic = topic.trim();
    makedirectory(topic);
    let link_repo = "";
    for (let i = 0; i < 8; i++) {
        link_repo = selectorTool(arr[i]).attr("href");
        let repoName = link_repo.split("/").pop();
        repoName = repoName.trim();
        let complete_link = "https://github.com" + link_repo + "/issues";
        // makefile(repoName,topic);
        getIssues(repoName, topic, complete_link);
    }
}
function getIssues(repoName, topic, repoPagelink) {
    request(repoPagelink, cb);
    function cb(error, response, html) {
        if (error) {
            if (response.statusCode == 404) {
                console.log("Issue page not found");
            } else {
                console.log(error);
            }
        }

        else {
            exactIssues(html, repoName, topic);
        }
    }
}



function exactIssues(html, repoName, topic) {
    let selectorTool = cheerio.load(html);
    let issueAnchore = selectorTool("a.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    let arr = [];
    for (let i = 0; i < issueAnchore.length; i++) {
        let name = selectorTool(issueAnchore[i]).text();
        let link = selectorTool(issueAnchore[i]).attr("href");
        arr.push(
            {
                "Name": name,
                "Link": "https://github.com" + link
            }
        )
    }
    // console.table(arr);
    let filePath = path.join(__dirname, topic, repoName + ".pdf");
    let pdfDoc = new PDFDocument;
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.text(JSON.stringify(arr));
    pdfDoc.end();
}
//Make folder
function makedirectory(topic) {
    // var dir = "C:/Users/hp/Desktop/WebScrapping/activity/"+topic;
    var dir = path.join(__dirname, topic);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);

    }
}

//Make json file
function makefile(repo_name, topic) {
    let pathoffile = path.join(__dirname, topic, repo_name + ".json")
    var createStream = fs.createWriteStream(pathoffile);
    createStream.end();
}

