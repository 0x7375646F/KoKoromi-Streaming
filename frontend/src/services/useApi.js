import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import {API_ANIME_URL} from "../config/config";


const fetchData = async (url) => {
  console.log(API_ANIME_URL);
  try {
    const { data } = await axios.get(API_ANIME_URL + url);

    return data;
  } catch (error) {
    throw new Error(error);
  }
};

export const useApi = (endpoint) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => fetchData(endpoint),
    retry: 2,
    enabled: !!endpoint,
    refetchOnWindowFocus: false,
  });
};

const fetchInfiniteData = async ({ queryKey, pageParam }) => {
  try {
    const { data } = await axios.get(API_ANIME_URL + queryKey + pageParam);
    return data;
  } catch (error) {
    throw new Error(error);
  }
};
export const useInfiniteApi = (endpoint) => {
  return useInfiniteQuery({
    queryKey: [endpoint],
    queryFn: fetchInfiniteData,
    initialPageParam: 1,
    retry: 0,
    getNextPageParam: (lastpage) => {
      if (lastpage.data.pageInfo.hasNextPage) {
        return lastpage.data.pageInfo.currentPage + 1;
      } else {
        return undefined;
      }
    },
  });
};
