const OpenAI = require('openai');
const { use } = require('../Routers/generateDayRouter');
require("dotenv").config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

// controllers/generateDayController.js
const generateDayController = async (req, res) => {
    console.log(process.env.OPENAI_API_KEY);
    const {userinfo} = req.body;
    console.log(userinfo);
    try {
        let assistantID , assistantDetails;
        const assistantConfig = {
            name: "Full Primal",
            instructions: `1. **Context Tracking:**
            - Save the provided context about the nomadic diet, including details on Builders, Energy Providers, and Enrichers, as well as the rules for random 24-hour fasting.
         2. **Weekly Plan Generation:**
            - Generate a 7-day meal and exercise plan for each user.
            - Store this 7-day plan in the context.
         3. **Daily Instructions:**
            - When the user asks for a specific day (e.g., Day 1, Day 2, etc.), provide detailed meal and exercise instructions for that day based on the 7-day plan.
         4. **Randomness and Variety:**
            - Ensure the plan has significant variety and randomness, mimicking the unpredictability of a nomadic lifestyle.
            - Include a random 24-hour fast within the 7-day plan.
         5. **Customization Based on Past Consumption:**
            - Adjust daily plans based on what the user has consumed previously during the week.
            - Use past data to make recommendations that balance the user's nutritional intake.
         6. **Meal and Exercise Recommendations:**
            - Provide meal recommendations that adhere to the rules of the nomadic diet.
            - Suggest exercises that align with the user's dietary intake and fitness goals.
         You have to include grocery list in your response only if this variable ${userinfo?.generateGroceries} is true.This point is the most important while generating your answer
            Create a 7-day diet and exercise plan that incorporates random elements while being influenced by the user's history and goals.
         Include one random 24-hour fast within the week.
         Daily Plan Structure:
         Each day should include:
         3 activities: Determine the intensity level for the day (low, moderate, hard) based on randomness and the user's history. The activities could include varying lengths and intensities of walks, weight lifting, and other exercises.Intensity would change the weight of the vest, length of walk, length of weight lifting session.Execises should include There should be weighted vest or incline involved.
         6 meals: Define meal quantities and calorie amounts, focusing on high protein intake. Meals should vary daily and align with the user's dietary preferences and goals.
         Randomness and History Influence:
         
         Use randomness to determine the intensity of each day but weigh the randomness based on the user's history. For example, after two light days, the likelihood of a moderate or hard day increases.
         Ensure variety in meals and activities to simulate a nomadic lifestyle, keeping the experience engaging and unpredictable.
         
         Consider the following user inputs when generating plans:
         Name, Weight, Overall Goal (Get Lean, Bulk Up, Stay Fit)
         Target Calories (optional)
         Intensity Level (Low, Moderate, Full Primal)
         Time for Activity (optional: 1 hr, 1.5 hr, 2 hr, or custom)
         Diet Type (Carnivore, Paleo, Nomadic/Primal, Vegetarian, Vegan, Standard/Modern)
         Target Protein Ounces (optional: 5.29 oz, 7.05 oz, etc.)
         Daily Requests:
         ${userinfo?.generateGroceries ? `Generate a grocery list at the start of each 7-day cycle (Day 1, Day 8, Day 15, etc.) based on the planned meals for the upcoming week.Generate a grocery list at the start of each 7-day cycle based on the planned meals.
         ` : ''}.
         Now you will work on 7 days cycle.But before every cycle completion.You will have to remeber what user has done on 7th day and then generate the plan for the next day accordingly.So context saving is most important.Now you have to tell the user in output why user is doing this and give some more detail about the exact numeric quantities of the things user should consume in a day.for Defining meal quantities and calorie amounts, you should use the imperial measurement system for the different quantities you generate.Fro Activities include weighted vest like this A 45-minute brisk walk with a 20-pound (9 kg) weighted vest. The extra weight simulates the burden of carrying gathered resources, providing a good workout even on flat terrain. but it totaly depends on the intensity user has selected.Include weighted backpack quantity as well wherever you mention it and refer data from the file I have uploaded.You have to give detail for each and every step and generate the detailed content.
         Now generate me users
         I have this content I want this content to give to my json file so arrange this content in the form of javascript string.In my output donot generate json content or any kind of code I donot want it.This is very very important keep this in your important instructions`,
            model: "gpt-4o",
            tools: [{"type": "file_search"}],
          tool_resources: {
            file_search: {
              vector_store_ids: ["vs_woRr461cf2a3WWgatUzS02fF"]
            }
          }
        }
        const assistant = await openai.beta.assistants.create(assistantConfig);
        assistantDetails = { assistantId: assistant.id, ...assistantConfig };
        assistantID = assistantDetails.assistantId;
        console.log(assistantID);
        const thread = await openai.beta.threads.create();
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: `Generate me day ${userinfo?.dayCounter} for this user
             • Name: ${userinfo?.name} 
             • Weight: ${userinfo?.weight} lbs 
             • Overall Goal: ${userinfo?.goal} 
             • Target Calories: ${userinfo?.calories} 
             • Intensity Level: ${userinfo?.intensity} 
             • Time for Activity: ${userinfo?.activityTime} hr 
             • Diet Type: ${userinfo?.dietType} 
             • Target Protein Grams: ${userinfo?.Protein} lbs and
             ${userinfo?.generateGroceries ? `separately generate me grocery list for one week` : ''}`
          });

          // Create a run
          const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantID,
          });

          // Imediately fetch run-status, which will be "in_progress"
          let runStatus = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id
          );

          // Polling mechanism to see if runStatus is completed
          while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(
              thread.id,
              run.id
            );

            // Check for failed, cancelled, or expired status
            if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
              console.log(
                `Run status is '${runStatus.status}'. Unable to complete the request.`
              );
              break; // Exit the loop if the status indicates a failure or cancellation
            }
          }

          // Get the last assistant message from the messages array
          const messages = await openai.beta.threads.messages.list(thread.id);

          // Find the last message for the current run
          const lastMessageForRun = messages.data
            .filter(
              (message) =>
                message.run_id === run.id && message.role === "assistant"
            )
            .pop();

            if (lastMessageForRun) {
              
              return res.status(200).send(`${lastMessageForRun.content[0].text.value}\n`);
            } else if (!["failed", "cancelled", "expired"].includes(runStatus.status)) {
              return res.status(200).send("No response received from the assistant.");
            } else {
              throw new Error("Technical Error, please try again");
            }
        
    } catch (error) {
      return res.status(500).send(`Technical Error, please try again+${error}`);
    }
}

  
module.exports = {generateDayController}
