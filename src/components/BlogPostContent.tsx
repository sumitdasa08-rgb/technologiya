import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPostContentProps {
  content: string;
}

const BlogPostContent = ({ content }: BlogPostContentProps) => {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-display prose-headings:text-foreground
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
        prose-strong:text-foreground
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-xl
        prose-li:text-muted-foreground prose-li:marker:text-primary
        prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:bg-secondary/30 prose-blockquote:rounded-r-xl prose-blockquote:py-1
        prose-img:rounded-xl prose-img:border prose-img:border-border
        prose-hr:border-border"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ""}
              className="rounded-xl border border-border my-6 w-full"
              loading="lazy"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default BlogPostContent;
