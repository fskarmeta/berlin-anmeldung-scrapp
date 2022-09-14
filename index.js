import cheerio from "cheerio";
import axios from "axios";
import open from "open";
import Audic from "audic";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
const audic = new Audic("./foo.mp3");


// 0 or 1 for first or second calendar table
const calendarTable = 0

// are inclusive
const minDateRange = 15
const maxDateRange = 16

async function scrapeData() {
  let found = false;
  let url = "https://service.berlin.de";
  try {
    const { data } = await client.get(
      "https://service.berlin.de/terminvereinbarung/termin/tag.php?termin=1&anliegen[]=120686&dienstleisterlist=122210,122217,327316,122219,327312,122227,327314,122231,327346,122243,327348,122252,329742,122260,329745,122262,329748,122254,329751,122271,327278,122273,327274,122277,327276,330436,122280,327294,122282,327290,122284,327292,327539,122291,327270,122285,327266,122286,327264,122296,327268,150230,329760,122301,327282,122297,327286,122294,327284,122312,329763,122314,329775,122304,327330,122311,327334,122309,327332,122281,327352,122279,329772,122276,327324,122274,327326,122267,329766,122246,327318,122251,327320,122257,327322,122208,327298,122226,327300&herkunft=http%3A%2F%2Fservice.berlin.de%2Fdienstleistung%2F120686%2F",
      {
        withCredentials: true,
      }
    );
    const $ = cheerio.load(data);
    $(".calendar-month-table")
      .eq(calendarTable)
      .find(".buchbar")
      .each((i, e) => {

        const num = parseInt($(e).text());
        console.log(`The ${num} is a appointment available`);
        if (num >= minDateRange && num <= maxDateRange) {
          console.log(`We found a day inside the range, day ${num}`);
          url += $(e).find("a").attr("href");
          found = true;
          return;
        }
      });
    console.log(
      found ? "Found one appointment, url wil open now" : "There are no appointments avilable in this round..."
    );
    if (found) {
      console.log(url)
      await open(url);
      await audic.play();
      return;
    }
    setTimeout(() => scrapeData(), Math.random() * (8000 - 4000) + 4000);
  } catch (e) {
    await client.get("https://service.berlin.de/dienstleistung/120686/", {
      withCredentials: true,
    });
    console.log("We have been bloqued.. lets wait a while");
    setTimeout(() => scrapeData(), 300000);
  }
}

scrapeData();

