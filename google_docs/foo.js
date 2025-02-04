import { axios } from "@pipedream/platform"
export default defineComponent({
  props: {
    dataforseo: {
      type: "app",
      app: "dataforseo",
    }
  },
  async run({steps, $}) {
    
    return await axios($, {
      url: `https://api.dataforseo.com/v3/content_generation/generate_sub_topics/live`,
      headers: {
        "Content-Type": `application/json`
      },
      auth: {
        username: `${this.dataforseo.$auth.api_login}`,
        password: `${this.dataforseo.$auth.api_password}`,
      },
      data: {
        topic: steps.trigger.event.body.keyword,
        creativity_index: '0.8'
      }
    })
  },
})
