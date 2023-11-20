var Rankfile = require('./rankfile');


const FIRST_URL = 'https://www.proxyrack.com/blog/puppeteer-waitforselector/';
const PRIMARY_KEYWORD_0 = 'puppeteer waitforselector';
const SECONDARY_KEYWORD_0 = 'puppeteer waitforselector a guide';

const SECOND_URL = 'https://csuitecontent.com/a-complete-guide-to-ghostwriting-for-a-ceo/'
const PRIMARY_KEYWORD_1 = 'a complete guide to ghostwriting for the ceo';
const SECONDARY_KEYWORD_1 = 'ceo ghostwriting';

const RANKFILE_CONTENTS = 
`${FIRST_URL},${PRIMARY_KEYWORD_0},${SECONDARY_KEYWORD_0}
${SECOND_URL},${PRIMARY_KEYWORD_1},${SECONDARY_KEYWORD_1}
`;

test('Returns URL for URL', () => {
    expect(new Rankfile(RANKFILE_CONTENTS).getUrl(0)).toEqual(FIRST_URL);
})

test('Returns keyword for first keyword', () => {
    expect(new Rankfile(RANKFILE_CONTENTS).getKeyword(0,0)).toEqual(PRIMARY_KEYWORD_0);
})

test('Returns keyword for second keyword', () => {
    expect(new Rankfile(RANKFILE_CONTENTS).getKeyword(0,1)).toEqual(SECONDARY_KEYWORD_0);
})

test('Returns proper URL for second line', () => {
    expect(new Rankfile(RANKFILE_CONTENTS).getUrl(1)).toEqual(SECOND_URL);
})

test('Returns keyword for second keyword on second line', () => {
    expect(new Rankfile(RANKFILE_CONTENTS).getKeyword(1,1)).toEqual(SECONDARY_KEYWORD_1);
})