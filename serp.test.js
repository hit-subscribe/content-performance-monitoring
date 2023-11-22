var Serp = require('./serp');

const Rank = 1;
const MatchingUrl = 'https://wikipedia.com/devops';
const SiteUrl = 'https://www.wikipedia.net';

var serpJson = JSON.parse(`
[
    {
      "result": [
        {
          "items_count": 2,
          "items": [
            {
              "type": "organic",
              "rank_group": 1,
              "rank_absolute": "${Rank}",
              "domain": "${SiteUrl}",
              "title": "What is DevOps?",
              "url": "${MatchingUrl}"
            }
          ]
        }
      ]
    }
  ]`
);

test('getRankOfUrl returns rank of matching result', () => {
    expect(new Serp(serpJson).getRankOfUrl(MatchingUrl)).toEqual(Rank);
})

test('getFirstOccurrenceOfSite returns rank of matching result', () => {
  expect(new Serp(serpJson).getFirstOccurrenceOfSite(SiteUrl)).toEqual(Rank);
})

test('getEntryNumber returns entry for that number', () => {
  expect(new Serp(serpJson).getEntryNumber(Rank).domain).toEqual(SiteUrl);
})