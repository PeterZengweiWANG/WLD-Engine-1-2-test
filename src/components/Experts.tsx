import { getGroqCompletion, getGroqCompletionParallel } from "@/ai/groq";
import { useState } from "react";

//function that runs multiple prompts for expert analysis and updates a given state object
export default function Experts({
  initState,
  systemPrompts,
  analysisPrompt,
  maxTokens,
  handleResponse,
}: {
  initState: any;
  systemPrompts: string[];
  analysisPrompt: string;
  maxTokens: number;
  handleResponse: (response: any) => void;
}) {
  const [state, setState] = useState<any>(initState);
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);

  const runPrompts = async () => {
    setGenerating(true);

    //this makes a groq request for each system prompt in parallel so it is fast
    const responses = await getGroqCompletionParallel(
      [JSON.stringify(state)],
      maxTokens,
      systemPrompts
    );

    //then we have another function that updates our state based on all of the responses
    const newState = await updateAnalysis(responses);
    setState(newState);
    setAnalysis(responses);
    handleResponse(newState);
    setGenerating(false);
  };

  const updateAnalysis = async (analysis: string[]) => {
    //Dumb system prompt to try to incorporate all of the analysis into the updated state
    //remove the previous annual report from the state to prevent it from being included in the analysis
    const { annualReport, ...currentState } = state;
    const stateString = JSON.stringify(currentState);
    const newState = await getGroqCompletion(
      `State JSON: ${stateString}, SWOT analysis from stakeholders: ${analysis.join(
        ","
      )}`,
      maxTokens,
      analysisPrompt,
      true
    );
    return JSON.parse(newState);
  };

  return (
    <div className="flex flex-col w-full">
      <button
        className="p-2 bg-white rounded-lg my-4"
        onClick={() => runPrompts()}
      >
        {generating ? "Generating..." : "Analyze"}
      </button>
      <div className="flex justify-between w-full flex-wrap">
        {systemPrompts.map((t, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg bg-white p-2 hover:shadow m-2"
          >
            <span className="font-semibold my-2">{systemPrompts[i]}</span>
            <span>{generating ? "Generating..." : analysis[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
