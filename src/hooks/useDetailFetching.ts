/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { message } from 'antd';
import apiService from '../services/api';

interface DetailFetchingParams {
  endpoint: string;
  id?: string;
  mappingFunction?: (item: any) => any;
}

export function useDetailFetching<T>({ endpoint, id, mappingFunction }: DetailFetchingParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchData = async () => {
    if (!id) {
      setError('No ID provided');
      setHasError(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<any>(`${endpoint}/${id}`);
      
      // Apply mapping function if provided, otherwise use response data directly
      const formattedData = mappingFunction ? mappingFunction(response.data) : response.data;
      
      setData(formattedData);
      setHasError(false);
    } catch (err: unknown) {
      console.error(`Failed to fetch data from ${endpoint}/${id}:`, err);
      setError(`Failed to load details. Please try again later.`);
      message.error(`Failed to load details.`);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, endpoint]);

  const handleRetry = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    hasError,
    handleRetry,
  };
}
