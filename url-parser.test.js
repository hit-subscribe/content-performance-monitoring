var htmlMethods = require('./url-parser');



//Get Title
test('returns text inside of h1', () => {
	expect(htmlMethods.getH1Title("<h1>Title</h1>")).toBe("Title");
});


//Get Tags from URL
test('returns empty string for base url', () => {
	expect(htmlMethods.getTags("https://site.com/")).toEqual(expect.arrayContaining([]));
})
test('returns empty string for base url with no trailing slash', () => {
	expect(htmlMethods.getTags("https://site.com")).toEqual(expect.arrayContaining([]));
})

test('returns blog for blog post', () => {
	expect(htmlMethods.getTags("https://site.com/blog/post/")).toEqual(expect.arrayContaining(['blog']));
})

test('returns nothing for just blog', () => {
	expect(htmlMethods.getTags("https://site.com/blog/")).toEqual(expect.arrayContaining([]));
})

test('returns nothing for just blog without trailing slash', () => {
	expect(htmlMethods.getTags("https://site.com/blog")).toEqual(expect.arrayContaining([]));
})

test('returns blog for blog post without trailing slash', () => {
	expect(htmlMethods.getTags("https://site.com/blog/post")).toEqual(expect.arrayContaining(['blog']));
})

test('returns resources for live example data from influx', () => {
	expect(htmlMethods.getTags("https://www.influxdata.com/resources/reasons-to-think-beyond-saas-monitoring-solution/")).toEqual(expect.arrayContaining(['resources']));
})

test('returns blog and page for live example from influx', () => {
	expect(htmlMethods.getTags("https://www.influxdata.com/blog/page/18/")).toEqual(expect.arrayContaining(['blog','page']));
})

test('returns blog and page for live example from influx with trailing slash removed', () => {
	expect(htmlMethods.getTags("https://www.influxdata.com/blog/page/18")).toEqual(expect.arrayContaining(['blog','page']));
})

test('returns blog and page and page number for example with three tags', () => {
	expect(htmlMethods.getTags("https://www.influxdata.com/blog/page/18/asdf/")).toEqual(expect.arrayContaining(['blog','page','18']));
})

test('returns blog, category, community, page, 11, feed for wild live example', () => {
	expect(htmlMethods.getTags("https://www.influxdata.com/blog/category/community/page/11/feed/json/")).toEqual(expect.arrayContaining(['blog','category','community', 'page', '11', 'feed']));
})

//Get Slug Title
test('returns post when appropriate', () => {
	expect(htmlMethods.getSlugTitle("https://site.com/blog/post")).toBe("post");
});

test('returns post when appropriate even with trailing slash', () => {
	expect(htmlMethods.getSlugTitle("https://site.com/blog/post/")).toBe("post");
});

test('returns empty string for base url', () => {
	expect(htmlMethods.getSlugTitle("https://site.com")).toBe("");
});

test('returns json for live Influx example', () => {
	expect(htmlMethods.getSlugTitle("https://www.influxdata.com/blog/category/community/page/11/feed/json/")).toBe("json");
});