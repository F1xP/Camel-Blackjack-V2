'use client';

import { ResponseObjectType } from '@/lib/types';
import { toast } from 'sonner';
import { useQueryClient, useMutation, MutationStatus } from '@tanstack/react-query';

type UpdateQueryConfig<TResponse extends ResponseObjectType> = {
  queryKey: [string, { [key: string]: string }?];
  updateFn: (oldData: any, response: TResponse) => any;
};

const useAction = <TArgs extends any[], TResponse extends ResponseObjectType = ResponseObjectType>(
  action: (...args: TArgs) => Promise<TResponse | void>,
  invalidateQueriesKeys?: Array<[string, { [key: string]: string }?]>,
  updateQueries?: UpdateQueryConfig<TResponse>[]
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TResponse | void, unknown, TArgs>({
    mutationFn: async (args) => {
      return await action(...args);
    },
    onSuccess: (response) => {
      if (!response) return;

      switch (response.type) {
        case 'SUCCESS':
          if (updateQueries && updateQueries.length > 0)
            updateQueries.forEach(({ queryKey, updateFn }) => {
              const oldData = queryClient.getQueryData(queryKey);
              const newData = updateFn(oldData, response);
              queryClient.setQueryData(queryKey, newData);
            });

          if (invalidateQueriesKeys && invalidateQueriesKeys.length > 0)
            invalidateQueriesKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

          if (response.showToast) toast.success(response.message, { duration: 6000 });
          if (response.redirect) window.location.replace(response.redirect);
          break;

        case 'INFO':
          if (response.showToast) toast.info(response.message, { duration: 6000 });
          if (response.redirect) window.location.replace(response.redirect);
          break;

        case 'WARNING':
          if (response.showToast) toast.warning(response.message, { duration: 6000 });
          if (response.redirect) window.location.replace(response.redirect);
          break;

        case 'ERROR':
          if (response.showToast) toast.error(response.message, { duration: 6000 });
          if (response.redirect) window.location.replace(response.redirect);
          break;

        default:
          break;
      }
    },
    onError: (error) => {
      toast.error('An unknown error occurred.', { duration: 6000 });
      console.error('Error executing action:', error);
    },
  });

  const execute = (...args: TArgs) => {
    mutation.mutate(args);
  };

  return {
    execute,
    loading: mutation.status === 'pending',
    status: mutation.status as MutationStatus,
  };
};

export default useAction;
