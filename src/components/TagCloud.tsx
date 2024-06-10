import { getGroqCompletion } from "@/ai/groq";
import { generateTagsPrompt } from "@/ai/prompts";
import { useEffect, useState } from "react";

type Tag = {
  text: string;
  selected: boolean;
};

//Generates a tag cloud (list of strings) using a prompt and total number of tags
//The handleSelect callback is called whenever a tag is selected
export default function GenerateTagCloud({
  prompt,
  totalTags,
  handleSelect,
}: {
  prompt: string;
  totalTags: number;
  handleSelect: (selectedTags: string[]) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);

  //Generate tags when the component is loaded
  useEffect(() => {
    //call Groq to generate tags
    const generateTags = async () => {
      const tagString = await getGroqCompletion(
        prompt,
        totalTags * 2,
        generateTagsPrompt
      );
      const tagOptions = tagString.split(",");
      setTags(tagOptions.map((text) => ({ text: text, selected: false })));
    };
    generateTags();
  }, [prompt, totalTags]);

  if (!tags.length) return <div>Loading...</div>;
  //render the tags
  return <TagCloud tags={tags} handleSelect={handleSelect} />;
}

//Component for rendering the tags and handling selection
export function TagCloud({
  tags,
  handleSelect,
}: {
  tags: Tag[];
  handleSelect: (selectedTags: string[]) => void;
}) {
  const [tagSelections, setTagSelections] = useState<Tag[]>(tags);

  //When a tag is selected, update the state and call the handleSelect callback
  function handleTagSelect(index: number) {
    const newTags = [...tags];
    newTags[index].selected = !newTags[index].selected;
    setTagSelections(newTags);
    handleSelect(newTags.filter((tag) => tag.selected).map((tag) => tag.text));
  }

  //render the tags
  return (
    <div className="flex justify-between w-full flex-wrap">
      {tagSelections.map((t, i) => (
        <button
          onClick={() => handleTagSelect(i)}
          key={i}
          className={`rounded-lg ${
            t.selected ? "bg-slate-500" : "bg-white"
          } p-2 hover:shadow m-2`}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}
