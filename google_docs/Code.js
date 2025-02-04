
  /* What should the add-on do after it is installed */
  function onInstall() {
    onOpen();
  }
  
  /* What should the add-on do when a document is opened */
  function onOpen() {
    DocumentApp.getUi()
    .createAddonMenu() // Add a new option in the Google Docs Add-ons Menu
    .addItem("Keyword Data", "showSidebar")
    .addToUi();  // Run the showSidebar function when someone clicks the menu
  }
  
  /* Show a 300px sidebar with the HTML from googlemaps.html */
  function showSidebar() {
    var html = HtmlService.createTemplateFromFile("keywords")
      .evaluate()
      .setTitle("Subtopics - Search"); // The title shows in the sidebar
    DocumentApp.getUi().showSidebar(html);
  }
  
  function getKeywordData(keyword) {
  
    keyword = "java exceptions";
  
    getSubTopics(keyword);
    getQuestions(keyword);
  
  }
  
  function getSubTopics(keyword) {
  
    var username = 'erik@hitsubscribe.com';
    var password = '8b3564dce0e01e5f';
    var encodedCredentials = Utilities.base64Encode(username + ':' + password);
  
    var subTopicsURL = 'https://api.dataforseo.com/v3/content_generation/generate_sub_topics/live';
  
    var subTopicsPayload = '[{"topic": "' + keyword + '", "creativity_index":0.8}]';
  
    var options = {
      method: 'post',
      headers: {
      'Authorization': 'Basic ' + encodedCredentials,
      'Content-Type': 'application/json'
      },
      payload: subTopicsPayload
    };
  
    var response = UrlFetchApp.fetch(subTopicsURL, options);
    var parsedResponse = JSON.parse(response.getContentText());
    var result = parsedResponse.tasks[0].result[0];
  
    var subTopics = "";
    for (var counter = 0; counter < result.sub_topics.length; counter = counter + 1) {
      subTopics = subTopics + result.sub_topics[counter] + '\n';
  
    }
  
    DocumentApp.getActiveDocument().replaceText("{subtopics}", subTopics);
  }
  
  
  function getQuestions(keyword) {
  
    var username = 'erik@hitsubscribe.com';
    var password = '8b3564dce0e01e5f';
    var encodedCredentials = Utilities.base64Encode(username + ':' + password);
  
    var askedURL = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced';
  
    var askedPayload = '[{"keyword":"' + keyword + '", "location_code":2840, "language_code":"en", "device":"desktop", "os":"windows", "depth":10, "group_organic_results":true, "people_also_ask_click_depth":4}]';
  
    var newOptions = {
        method: 'post',
        headers: {
       'Authorization': 'Basic ' + encodedCredentials,
       'Content-Type': 'application/json'
       },
       payload: askedPayload
    };
  
    Logger.log(newOptions);
  
    var newResponse = UrlFetchApp.fetch(askedURL, newOptions);
  
  
    var nextResponse = JSON.parse(newResponse.getContentText());
    var newResult = nextResponse.tasks[0].result[0];
  
    var asked = "";
    for (var counter = 0; counter < newResult.items.length; counter = counter + 1) {
      if (newResult.items[counter].type === "people_also_ask") {
        asks = newResult.items[counter];
        for (var inner = 0; inner < asks.items.length; inner = inner + 1) {
          Logger.log(asks.items[inner]);
          asked = asked + '\n' + asks.items[inner].title + '\n';
        }
      }
    }
  
    Logger.log(asked);
    DocumentApp.getActiveDocument().replaceText("{questions}", asked);
  
  }
  