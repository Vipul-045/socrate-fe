/**
 * Blog content.
 *
 * Posts are plain data — no CMS, no markdown parser. A post body is an
 * ordered list of blocks so the renderer stays a `switch` with no
 * dangerouslySetInnerHTML.
 *
 * NOTE: the two essays below are starter copy written to match the design.
 * Replace the `body` blocks with your own writing before launch.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  date: string; // ISO — formatted at render time
  readingMinutes: number;
  excerpt: string;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "why-re-reading-your-notes-doesnt-work",
    title: "Why re-reading your notes doesn't work",
    date: "2026-03-24",
    readingMinutes: 6,
    excerpt:
      "Highlighting feels like studying, but recognition isn't recall. A look at the retrieval-practice research and how to restructure a study session around questions instead of passes.",
    body: [
      {
        type: "p",
        text: "Almost every student converges on the same method without being taught it: read the chapter, highlight what looks important, then read the highlights again the night before. It feels productive. The page gets more familiar with every pass, and familiarity is easy to mistake for understanding.",
      },
      {
        type: "p",
        text: "The problem is that the two are not the same skill. Recognising a sentence you have seen four times is not the same as producing it from an empty page, and an exam only ever asks for the second one.",
      },
      { type: "h2", text: "Fluency is not knowledge" },
      {
        type: "p",
        text: "Cognitive psychologists call this the fluency illusion. Each re-read lowers the effort needed to process the text, and your brain reads that drop in effort as a signal that the material is learned. The signal is measuring how easy the page is to look at, not how well you could reconstruct it.",
      },
      {
        type: "quote",
        text: "The conditions that make learning feel easy are usually the conditions that make it stick least.",
      },
      {
        type: "p",
        text: "This is why students who re-read consistently rate themselves as better prepared than students who quiz themselves — and consistently score lower. Confidence tracks fluency. Performance tracks retrieval.",
      },
      { type: "h2", text: "Retrieval is the study method" },
      {
        type: "p",
        text: "The alternative is unglamorous: close the notes and try to answer a question about them. Every time you pull something out of memory, you make it easier to pull out again. The effort of failing to remember, then checking, does more work than another clean pass over the page.",
      },
      {
        type: "p",
        text: "A useful rule of thumb is to spend a third of your time reading and two thirds testing. That ratio feels wrong the first week, because testing exposes what you don't know while re-reading lets you keep believing you do.",
      },
      { type: "h2", text: "Restructuring a session" },
      {
        type: "list",
        items: [
          "Read once, at normal speed, with no highlighter in your hand.",
          "Close the document and write down everything you remember. Expect this to be thin.",
          "Open it again and mark only the gaps — the parts you couldn't produce.",
          "Turn each gap into a question rather than a highlight.",
          "Come back to those questions tomorrow, then in three days, then in a week.",
        ],
      },
      {
        type: "p",
        text: "The last step is the one people skip. Spacing the repeats out is what moves an answer from a thing you just read to a thing you know, and the intervals matter more than the total hours.",
      },
      { type: "h2", text: "Where Socrate fits" },
      {
        type: "p",
        text: "The reason most students don't study this way is that writing good questions about a document is slower than highlighting it. That is the step we automate: upload the PDF and Socrate generates the questions, marks what you couldn't answer, and brings those back later. The method is decades old. We just removed the part that made it tedious.",
      },
    ],
  },
  {
    slug: "how-we-built-an-ai-tutor-that-cites-its-sources",
    title: "How we built an AI tutor that cites its sources",
    date: "2026-03-11",
    readingMinutes: 4,
    excerpt:
      "An AI that sounds confident is easy. An AI you can check is harder. Notes on the retrieval layer behind Socrate and why every answer points back to a page in your PDF.",
    body: [
      {
        type: "p",
        text: "A study tool has an unusual failure mode. If a chatbot invents a restaurant recommendation you find out at dinner. If a study tool invents a definition, you memorise it, repeat it in an exam, and never find out at all.",
      },
      {
        type: "p",
        text: "So the first thing we decided about Socrate was not which model to use. It was that no answer ships without a pointer to the page it came from.",
      },
      { type: "h2", text: "Retrieve, then answer" },
      {
        type: "p",
        text: "When you upload a PDF we split it into passages that respect the document's own structure — a section heading starts a new passage, a table stays whole — rather than cutting every N characters. Each passage keeps its page number and heading path.",
      },
      {
        type: "p",
        text: "A question is answered in two stages. We first find the passages most likely to contain the answer, then hand only those to the model along with an instruction to answer from them and nothing else. If the passages don't contain an answer, the correct output is to say so.",
      },
      { type: "h2", text: "Making 'I don't know' cheap" },
      {
        type: "p",
        text: "Models are trained to be helpful, which under pressure means guessing. Most of our prompt work went into making abstention a normal, low-cost outcome instead of a failure — and into checking, after generation, that every claim in the answer is actually supported by a retrieved passage. Claims that aren't get dropped before you see them.",
      },
      {
        type: "quote",
        text: "An answer you can check in ten seconds is worth more than a better answer you have to trust.",
      },
      { type: "h2", text: "Citations as an interface, not a footnote" },
      {
        type: "p",
        text: "Every sentence in an answer links to the passage behind it, and clicking it scrolls the PDF to that spot with the passage highlighted. This does two things: it makes verification fast enough that people actually do it, and it turns the citation into a way to read further rather than a disclaimer nobody clicks.",
      },
      {
        type: "p",
        text: "It also keeps us honest. When the retrieval layer is weak, bad citations are obvious to every user immediately — which is a much better bug report than a plausible-sounding paragraph.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}
