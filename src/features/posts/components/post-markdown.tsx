import Markdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
      className="text-primary focus-visible:ring-ring rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2"
    >
      {children}
    </a>
  ),
};

export const PostMarkdown = ({ body }: { body: string }) => (
  <div className="text-foreground [&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_code]:bg-muted [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_pre]:bg-muted max-w-prose leading-relaxed wrap-anywhere [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_code]:rounded-sm [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6 [&>*+*]:mt-4">
    <Markdown skipHtml disallowedElements={["img"]} components={components}>
      {body}
    </Markdown>
  </div>
);
