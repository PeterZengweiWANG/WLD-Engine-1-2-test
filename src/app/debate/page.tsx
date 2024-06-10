"use client";
import Debate from "@/components/Debate";
import TextToSpeech from "@/components/TextToSpeech";
import { useState } from "react";

//Anything you want in your scenario to track over time goes here
//This should really be things like current challenges, disasters, successes, design issues etc
const initState = {
  newNuclearPlants: "",
  geopoliticalConflict: "",
  macroeconomicImplications: "",
  debateSummary: "",
};

const debateTopic =
  "The cold war would still be going if chernobyl didn't happen";

//Demo of simulating a debate about a given topic
export default function DebatePage() {
  const [state, setState] = useState<any>(initState);

  const handleResponse = (newState: any) => {
    //do something with the new state
    setState(newState);
  };
  return (
    <main className="flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col w-full">
          <div>
            <span>{debateTopic}</span>
            {Object.keys(state).map((key) => (
              <div className="flex justify-between" key={key}>
                <span className="font-semibold">{key}: </span>
                <span>{state[key]}</span>
              </div>
            ))}
          </div>

          <Debate
            initState={state}
            debateTopic={debateTopic}
            maxTokens={256}
            handleResponse={handleResponse}
          />
          <TextToSpeech
            text={state.debateSummary}
            showControls={true}
            autoPlay={true}
          />
        </div>
      </div>
    </main>
  );
}
