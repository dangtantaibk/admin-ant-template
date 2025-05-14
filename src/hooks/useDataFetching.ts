/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import apiService from '../services/api';
import { TableParams } from '../types';

interface FetchParams {
  endpoint: string;
  mappingFunction?: (item: any) => any;
}

export function useDataFetching<T>({ endpoint, mappingFunction }: FetchParams) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
  });
  
  // Use refs to track state without causing re-renders
  const paramsRef = useRef(tableParams);
  const shouldFetchRef = useRef(true);

  // Update the ref when tableParams changes
  useEffect(() => {
    paramsRef.current = tableParams;
  }, [tableParams]);

  const fetchData = async () => {
    if (hasError && !shouldFetchRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: paramsRef.current.pagination?.current,
        limit: paramsRef.current.pagination?.pageSize,
        sortField: paramsRef.current.sortField,
        sortOrder: paramsRef.current.sortOrder ? String(paramsRef.current.sortOrder) : undefined,
      };

      const response = await apiService.get<any>(endpoint, params);
      
      // Handle different response structures
      let responseData: any[] = [];
      let totalItems = 0;
      
      if (response.data && Array.isArray(response.data)) {
        responseData = response.data;
        totalItems = response.data.length;
      } else if (response.data && Array.isArray(response.data.data)) {
        responseData = response.data.data;
        totalItems = response.data.total || responseData.length;
      } else if (response && Array.isArray(response)) {
        responseData = response;
        totalItems = response.length;
      }
      
      // Apply mapping function if provided
      const mappedData: T[] = mappingFunction 
        ? responseData.map(mappingFunction) 
        : responseData;
      
      setData(mappedData);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: totalItems,
        },
      }));
      setHasError(false);
      shouldFetchRef.current = false;
    } catch (err: unknown) {
      console.error(`Failed to fetch data from ${endpoint}:`, err);
      setError(`Failed to load data. Please try again later.`);
      message.error(`Failed to load data.`);
      setHasError(true);
      shouldFetchRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or when shouldFetch changes
  useEffect(() => {
    if (shouldFetchRef.current) {
      fetchData();
    }
  }, [shouldFetchRef.current]);

  const handleRetry = () => {
    shouldFetchRef.current = true;
    setHasError(false);
    fetchData();
  };

  const refreshData = () => {
    shouldFetchRef.current = true;
    fetchData();
  };

  const updateParams = (newParams: TableParams) => {
    setTableParams(newParams);
    shouldFetchRef.current = true;
  };

  return {
    data,
    loading,
    error,
    hasError,
    tableParams,
    updateParams,
    handleRetry,
    refreshData,
  };
}
