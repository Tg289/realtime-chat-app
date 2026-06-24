import {
  useInfiniteQuery,
} from "@tanstack/react-query";

import axios from "axios";

export default function useInfiniteMessages(
  roomId: string
) {
  return useInfiniteQuery({
    queryKey: [
      "messages",
      roomId,
    ],

    queryFn: async ({
      pageParam,
    }) => {
      const res =
        await axios.get(
          "/api/messages/history",
          {
            params: {
              roomId,
              cursor:
                pageParam,
            },
          }
        );

      return res.data;
    },

    initialPageParam: null,

    getNextPageParam: (
      lastPage
    ) => {
      if (
        lastPage.length < 20
      )
        return undefined;

      return lastPage[
        lastPage.length - 1
      ].id;
    },
  });
}