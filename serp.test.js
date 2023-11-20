var Serp = require('./serp');

const Rank = 1;
const MatchingUrl = 'https://wikipedia.com/devops';

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
              "domain": "www.wikipedia.net",
              "title": "What is DevOps?",
              "url": "${MatchingUrl}"
            }
          ]
        }
      ]
    }
  ]`
);

test('returns rank of matching result ', () => {
    expect(new Serp(serpJson).getRankOfUrl(MatchingUrl)).toEqual(Rank);
})