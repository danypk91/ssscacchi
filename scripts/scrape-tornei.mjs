import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const YEAR_PAGES = [
  { year: 2025, url: "https://santasabina.altervista.org/index.php/tornei/43-tornei-anno-2025/421-tornei-anno-2025" },
  { year: 2024, url: "https://santasabina.altervista.org/index.php/tornei/42-tornei-anno-2024/388-tornei-anno-2024" },
  { year: 2023, url: "https://santasabina.altervista.org/index.php/tornei/41-tornei-anno-2023/331-tornei-anno-2023" },
  { year: 2022, url: "https://santasabina.altervista.org/index.php/tornei/40-tornei-anno-2022/302-tornei-anno-2022" },
  { year: 2021, url: "https://santasabina.altervista.org/index.php/tornei/39-tornei-anno-2021/294-tornei-anno-2021" },
  { year: 2020, url: "https://santasabina.altervista.org/index.php/tornei/38-tornei-anno-2020/273-tornei-anno-2020" },
  { year: 2019, url: "https://santasabina.altervista.org/index.php/tornei/37-tornei-anno-2019/231-tornei-anno-2019" },
  { year: 2018, url: "https://santasabina.altervista.org/index.php/tornei/36-tornei-anno-2018/203-tornei-anno-2018" },
  { year: 2017, url: "https://santasabina.altervista.org/index.php/tornei/35-tornei-anno-2017/164-tornei-anno-2017" },
  { year: 2016, url: "https://santasabina.altervista.org/index.php/tornei/32-tornei-anno-2016/107-tornei-anno-2016" },
  { year: 2015, url: "https://santasabina.altervista.org/index.php/tornei/31-tornei-anno-2015/76-tornei-anno-2015" },
  { year: 2014, url: "https://santasabina.altervista.org/index.php/tornei/29-tornei-anno-2014/47-tornei-anno-2014" },
  { year: 2013, url: "https://santasabina.altervista.org/index.php/tornei/23-tornei-anno-2013/14-tornei-anno-2013" },
  { year: 2012, url: "https://santasabina.altervista.org/index.php/tornei/24-tornei-anno-2012/15-tornei-anno-2012" },
  { year: 2011, url: "https://santasabina.altervista.org/index.php/tornei/25-tornei-anno-2011/17-tornei-anno-2011" },
  { year: 2010, url: "https://santasabina.altervista.org/index.php/tornei/26-tornei-anno-2010/23-tornei-anno-2010" },
];

const OUTPUT_DIR = resolve('./scripts/scraped-tornei');
mkdirSync(OUTPUT_DIR, { recursive: true });

async function fetchPage(entry) {
  try {
    const res = await fetch(entry.url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) {
      console.error(`HTTP ${res.status} for ${entry.year}`);
      return null;
    }
    const html = await res.text();
    return { year: entry.year, html };
  } catch (err) {
    console.error(`Error fetching ${entry.year}: ${err.message}`);
    return null;
  }
}

async function main() {
  for (const entry of YEAR_PAGES) {
    const result = await fetchPage(entry);
    if (result) {
      writeFileSync(
        resolve(OUTPUT_DIR, `${result.year}.html`),
        result.html
      );
      console.log(`Saved ${result.year}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('Done!');
}

main();