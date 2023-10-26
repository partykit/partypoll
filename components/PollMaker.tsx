"use client";

import { useRef, useState } from "react";
import Button from "./Button";
import Input from "./Input";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 8;

export default function PollMaker() {
  const [newOption, setNewOption] = useState<string>("");
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const newOptionRef = useRef<HTMLInputElement>(null);
  const addNewOption = () => {
    if (newOption?.trim().length !== 0) {
      setOptions((prevOptions) => [...prevOptions, newOption]);
      setNewOption("");
    }
  };

  const canAdd = options.length < MAX_OPTIONS;
  const canSubmit =
    title.length > 0 &&
    options.length >= MIN_OPTIONS &&
    options.filter((option) => option.trim().length === 0).length === 0;

  return (
    <>
      <Input
        placeholder="Poll title"
        type="text"
        name="title"
        className={"text-2xl font-bold"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            newOptionRef.current?.focus();
          }
        }}
      />
      <ul className="flex flex-col space-y-4">
        {options.map((value, i) => (
          <li className="flex" key={i}>
            <Input type="text" name={`option-${i}`} defaultValue={value} />
          </li>
        ))}
        {canAdd && (
          <li className="flex space-x-4">
            <Input
              ref={newOptionRef}
              type="text"
              name="option-new"
              placeholder="New option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newOption.length > 0) {
                    addNewOption();
                  }
                }
              }}
            />
            <Button theme="light" onClick={addNewOption}>
              Add
            </Button>
          </li>
        )}
      </ul>
      <Button type="submit" disabled={!canSubmit}>
        Create poll
      </Button>
    </>
  );
}
