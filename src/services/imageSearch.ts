// RENEW KEY
// https://docs.microsoft.com/en-us/azure/cognitive-services/bing-web-search/quick-start
const baseUri = "https://api.cognitive.microsoft.com/bing/v7.0/images/search"
const subscriptionKey = "cb1b401c417d45be9c7c4da982ea7128"

export async function query (query: string): Promise<any> {
    const response = await fetch(`${baseUri}?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
            "Ocp-Apim-Subscription-Key": subscriptionKey
        }
    })

    const json = await response.json()
    if (!response.ok) {
        throw new Error(json)
    }

    return json
}
