export const api = {
  functions: {
    ask: {
      chat: "functions/ask:chat",
      search: "functions/ask:search",
    },
    loadPages: {
      savePage: "functions/loadPages:savePage",
      ingest: "functions/loadPages:ingest",
    },
  },
};

export const internal = {
  functions: {
    ask: {
      search: "functions/ask:search",
    },
    loadPages: {
      savePage: "functions/loadPages:savePage",
    },
  },
};
