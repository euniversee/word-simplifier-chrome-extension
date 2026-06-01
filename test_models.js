const apiKey = "AIzaSyBvxmCMU0qzjjG3zZDRUxw2Js6KyzC-RHc";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return;
    }
    const data = await response.json();
    console.log(`Found ${data.models.length} models.`);
    const textModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    console.log("Models supporting text generation:");
    textModels.forEach(m => {
      console.log(`- ${m.name}`);
    });
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

listModels();
