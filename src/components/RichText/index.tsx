import React from "react";
import renderRichText from "@/lib/renderRichText";
import { IRichTextProps } from "./types";

const RichText: React.FC<IRichTextProps> = ({ content }) => {
  return (
    <div className={"prose prose-stone max-w-full lg:prose-xl"}>
      {renderRichText(content)}
    </div>
  );
};

export default RichText;
